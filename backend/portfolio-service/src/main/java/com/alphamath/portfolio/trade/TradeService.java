package com.alphamath.portfolio.trade;

import com.alphamath.portfolio.compliance.ComplianceService;
import com.alphamath.portfolio.execution.ExecutionService;
import com.alphamath.portfolio.math.BlackLitterman;
import com.alphamath.portfolio.math.MathUtils;
import com.alphamath.portfolio.math.Optimizers;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TradeService {
  private final Map<String, PaperAccount> accounts = new ConcurrentHashMap<>();
  private final Map<String, TradeProposal> proposals = new ConcurrentHashMap<>();
  private final ComplianceService compliance;
  private final ExecutionService execution;
  private final double feeBps;

  public TradeService(ComplianceService compliance, ExecutionService execution,
                      @Value("${alphamath.platform.feeBps:50}") double feeBps) {
    this.compliance = compliance;
    this.execution = execution;
    this.feeBps = Math.max(0.0, feeBps);
  }

  public PaperAccount getAccount(String userId) {
    return accounts.computeIfAbsent(userId, id -> new PaperAccount());
  }

  public PaperAccount seedAccount(String userId, TradeSeedRequest req) {
    PaperAccount acct = new PaperAccount();
    acct.setCash(req.getCash());
    acct.setPositions(new LinkedHashMap<>(req.getPositions()));
    acct.setUpdatedAt(Instant.now());
    accounts.put(userId, acct);
    return acct;
  }

  public TradeProposal getProposal(String userId, String id) {
    TradeProposal p = proposals.get(id);
    if (p == null || !userId.equals(p.getUserId())) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposal not found");
    }
    return p;
  }

  public TradeProposal createProposal(String userId, TradeProposalRequest req) {
    validateRequest(req);

    List<String> symbols = req.getSymbols();
    double[] mu = MathUtils.toVector(req.getMu());
    double[][] cov = MathUtils.toMatrix(req.getCov());
    double[] w = computeWeights(req, mu, cov);

    PaperAccount acct = getAccount(userId);
    Map<String, Double> positions = acct.getPositions();
    double cash = acct.getCash();

    Map<String, Double> prices = new LinkedHashMap<>();
    Map<String, Double> currentValues = new LinkedHashMap<>();
    double totalEquity = cash;
    for (String symbol : symbols) {
      Double price = req.getPrices().get(symbol);
      if (price == null || price <= 0) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing or invalid price for " + symbol);
      }
      prices.put(symbol, price);

      double qty = positions.getOrDefault(symbol, 0.0);
      double value = qty * price;
      currentValues.put(symbol, value);
      totalEquity += value;
    }

    if (totalEquity <= 0.0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account equity must be positive");
    }

    Map<String, Double> currentWeights = new LinkedHashMap<>();
    Map<String, Double> targetWeights = new LinkedHashMap<>();
    for (int i = 0; i < symbols.size(); i++) {
      String symbol = symbols.get(i);
      currentWeights.put(symbol, currentValues.get(symbol) / totalEquity);
      targetWeights.put(symbol, w[i]);
    }

    double expectedReturn = 0.0;
    for (int i = 0; i < mu.length; i++) expectedReturn += w[i] * mu[i];
    double variance = MathUtils.quadForm(cov, w);

    TradeProposal proposal = new TradeProposal();
    proposal.setId(UUID.randomUUID().toString());
    proposal.setUserId(userId);
    proposal.setCreatedAt(Instant.now());
    proposal.setStatus(TradeStatus.PENDING_USER);
    proposal.setExecutionMode(req.getExecutionMode() == null ? ExecutionMode.PAPER : req.getExecutionMode());
    proposal.setRegion(req.getRegion() == null ? proposal.getRegion() : req.getRegion());
    proposal.setAssetClass(req.getAssetClass() == null ? proposal.getAssetClass() : req.getAssetClass());
    proposal.setProviderPreference(req.getProviderPreference());
    proposal.setOrderType(req.getOrderType() == null ? proposal.getOrderType() : req.getOrderType());
    proposal.setTimeInForce(req.getTimeInForce() == null ? proposal.getTimeInForce() : req.getTimeInForce());
    proposal.setSymbols(new ArrayList<>(symbols));
    proposal.setPrices(prices);
    proposal.setCurrentWeights(currentWeights);
    proposal.setTargetWeights(targetWeights);
    proposal.setExpectedReturn(expectedReturn);
    proposal.setVariance(variance);
    proposal.setTotalEquity(totalEquity);

    buildOrdersAndChecks(req, proposal, currentValues, cash);
    if (proposal.getExecutionMode() == ExecutionMode.LIVE) {
      proposal.getPolicyChecks().addAll(compliance.complianceChecks(userId));
      boolean brokerLinked = execution.hasLinkedAccount(userId, proposal.getRegion(), proposal.getAssetClass(), proposal.getProviderPreference());
      proposal.getPolicyChecks().add(buildCheck("Broker account", brokerLinked, brokerLinked ? "Linked" : "Not linked"));
    }
    proposal.setAi(buildAiRecommendation(req, proposal));
    proposal.setDisclaimer("AI proposal requires user confirmation. Platform fee " + round(feeBps, 2)
        + " bps applies to buy and sell notional. Not financial advice.");

    proposals.put(proposal.getId(), proposal);
    return proposal;
  }

  public TradeProposal decide(String userId, String id, TradeDecisionRequest req) {
    TradeProposal p = getProposal(userId, id);
    if (p.getStatus() != TradeStatus.PENDING_USER) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Proposal is not pending");
    }

    if (req.getAction() == DecisionAction.WAIT) {
      return p;
    }
    if (req.getAction() == DecisionAction.DECLINE) {
      p.setStatus(TradeStatus.DECLINED);
      return p;
    }

    p.setStatus(TradeStatus.APPROVED);

    if (p.getExecutionMode() == ExecutionMode.LIVE) {
      compliance.requireLiveEligibility(userId);
      if (!execution.hasLinkedAccount(userId, p.getRegion(), p.getAssetClass(), p.getProviderPreference())) {
        throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "Broker account not linked");
      }
      var intent = execution.createIntent(userId, p);
      p.setExecutionIntentId(intent.getId());
      p.setStatus(TradeStatus.SUBMITTED);
      return p;
    }

    TradeExecution exec = executeProposal(userId, p);
    p.setExecution(exec);
    p.setStatus(TradeStatus.EXECUTED);
    return p;
  }

  private void validateRequest(TradeProposalRequest req) {
    int n = req.getSymbols().size();
    if (req.getMu().size() != n) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "mu length must match symbols");
    }
    if (req.getCov().size() != n) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cov must be NxN");
    }
    for (var row : req.getCov()) {
      if (row.size() != n) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cov must be NxN");
      }
    }
  }

  private double[] computeWeights(TradeProposalRequest req, double[] mu, double[][] cov) {
    Optimizers.Method method = req.getMethod() == null ? Optimizers.Method.MEAN_VARIANCE_PGD : req.getMethod();
    return switch (method) {
      case MEAN_VARIANCE_PGD -> Optimizers.optimizeMeanVariancePGD(mu, cov, req.getRiskAversion(),
          req.getMinWeight(), req.getMaxWeight(), 4000, 0.02);
      case MIN_VARIANCE -> Optimizers.optimizeMinVariance(cov, req.getMinWeight(), req.getMaxWeight(), 4000, 0.02);
      case RISK_PARITY -> Optimizers.optimizeRiskParity(cov, req.getMinWeight(), req.getMaxWeight(), 1200);
      case KELLY_APPROX -> Optimizers.optimizeKellyApprox(mu, cov,
          req.getFractionalKelly() == null ? 0.25 : req.getFractionalKelly(),
          req.getMinWeight(), req.getMaxWeight());
      case BLACK_LITTERMAN_MEANVAR -> {
        if (req.getP() == null || req.getP().isEmpty() || req.getQ() == null || req.getQ().isEmpty()
            || req.getOmegaDiag() == null || req.getOmegaDiag().isEmpty()) {
          yield Optimizers.optimizeMeanVariancePGD(mu, cov, req.getRiskAversion(),
              req.getMinWeight(), req.getMaxWeight(), 4000, 0.02);
        }
        double[][] Pm = new double[req.getP().size()][mu.length];
        for (int i = 0; i < req.getP().size(); i++) {
          var row = req.getP().get(i);
          for (int j = 0; j < mu.length; j++) Pm[i][j] = row.get(j);
        }
        double[] qv = MathUtils.toVector(req.getQ());
        double[] od = MathUtils.toVector(req.getOmegaDiag());
        double tau = req.getTau() == null ? 0.05 : req.getTau();
        var bl = BlackLitterman.posterior(mu, cov, tau, Pm, qv, od);
        yield Optimizers.optimizeMeanVariancePGD(bl.posteriorMu, bl.posteriorCov, req.getRiskAversion(),
            req.getMinWeight(), req.getMaxWeight(), 5000, 0.02);
      }
      default -> Optimizers.optimizeMeanVariancePGD(mu, cov, req.getRiskAversion(),
          req.getMinWeight(), req.getMaxWeight(), 4000, 0.02);
    };
  }

  private void buildOrdersAndChecks(TradeProposalRequest req, TradeProposal proposal,
                                    Map<String, Double> currentValues, double cash) {
    double feeRate = feeBps / 10000.0;
    double totalEquity = proposal.getTotalEquity();
    double minTrade = req.getMinTradeValue() == null ? 0.0 : req.getMinTradeValue();
    double maxTurnover = req.getMaxTurnover() == null ? 1.0 : req.getMaxTurnover();
    double maxTradePct = req.getMaxTradePctOfEquity() == null ? 1.0 : req.getMaxTradePctOfEquity();
    double maxTradeNotional = Math.max(0.0, maxTradePct * totalEquity);

    boolean minTradeSkipped = false;
    boolean oversizedTrades = false;

    double buyNotional = 0.0;
    double sellNotional = 0.0;
    double turnover = 0.0;

    List<TradeOrder> orders = new ArrayList<>();
    for (String symbol : proposal.getSymbols()) {
      double price = proposal.getPrices().get(symbol);
      double current = currentValues.get(symbol);
      double targetValue = proposal.getTargetWeights().get(symbol) * totalEquity;
      double delta = targetValue - current;
      turnover += Math.abs(delta) / totalEquity;

      if (Math.abs(delta) < minTrade) {
        minTradeSkipped = true;
        continue;
      }

      TradeOrder order = new TradeOrder();
      order.setSymbol(symbol);
      order.setPrice(price);
      order.setSide(delta >= 0 ? TradeSide.BUY : TradeSide.SELL);
      double notional = Math.abs(delta);
      double qty = notional / price;

      if (maxTradeNotional > 0 && notional > maxTradeNotional) {
        double factor = maxTradeNotional / notional;
        notional *= factor;
        qty *= factor;
        oversizedTrades = true;
      }

      order.setQuantity(qty);
      order.setNotional(notional);
      order.setFee(notional * feeRate);
      orders.add(order);

      if (order.getSide() == TradeSide.BUY) buyNotional += notional;
      else sellNotional += notional;
    }

    double sellFeeTotal = 0.0;
    for (TradeOrder order : orders) {
      if (order.getSide() == TradeSide.SELL) sellFeeTotal += order.getFee();
    }
    double availableCash = cash + Math.max(0.0, sellNotional - sellFeeTotal);
    double scaledBuyFactor = 1.0;
    double buyCost = 0.0;
    for (TradeOrder order : orders) {
      if (order.getSide() == TradeSide.BUY) {
        buyCost += order.getNotional() + order.getFee();
      }
    }
    if (buyCost > availableCash && buyCost > 1e-12) {
      scaledBuyFactor = availableCash / buyCost;
      buyNotional = 0.0;
      for (TradeOrder order : orders) {
        if (order.getSide() == TradeSide.BUY) {
          order.setQuantity(order.getQuantity() * scaledBuyFactor);
          order.setNotional(order.getNotional() * scaledBuyFactor);
          order.setFee(order.getFee() * scaledBuyFactor);
          buyNotional += order.getNotional();
        }
      }
    }

    double feeTotal = 0.0;
    for (TradeOrder order : orders) {
      feeTotal += order.getFee();
    }

    proposal.setOrders(orders);
    proposal.setTurnover(turnover);
    proposal.setScaledBuyFactor(scaledBuyFactor);
    proposal.setFeeBps(feeBps);
    proposal.setFeeTotal(feeTotal);

    List<PolicyCheck> checks = new ArrayList<>();
    checks.add(buildCheck("Turnover", turnover <= maxTurnover, "Turnover=" + round(turnover, 4) + " max=" + maxTurnover));
    checks.add(buildCheck("Platform fee", true, "Fee " + round(feeBps, 2) + " bps (buy+sell) = " + round(feeTotal, 2)));
    if (scaledBuyFactor < 1.0) {
      checks.add(buildCheck("Cash coverage", false, "Buys scaled by " + round(scaledBuyFactor, 3) + " to fit cash"));
    } else {
      checks.add(buildCheck("Cash coverage", true, "Buys fit available cash"));
    }
    if (oversizedTrades) {
      checks.add(buildCheck("Max trade size", false, "Trades clipped to " + round(maxTradeNotional, 2)));
    } else {
      checks.add(buildCheck("Max trade size", true, "All trades within limit"));
    }
    if (minTradeSkipped) {
      checks.add(buildCheck("Min trade value", false, "Some trades skipped under " + round(minTrade, 2)));
    } else {
      checks.add(buildCheck("Min trade value", true, "All trades above minimum"));
    }
    if (orders.isEmpty()) {
      checks.add(buildCheck("No-op", false, "No actionable trades generated"));
    }
    proposal.setPolicyChecks(checks);
  }

  private TradeExecution executeProposal(String userId, TradeProposal proposal) {
    PaperAccount acct = getAccount(userId);
    synchronized (acct) {
      double cash = acct.getCash();
      Map<String, Double> positions = new LinkedHashMap<>(acct.getPositions());
      List<TradeOrder> filled = new ArrayList<>();
      double totalFees = 0.0;

      for (TradeOrder order : proposal.getOrders()) {
        if (order.getSide() != TradeSide.SELL) continue;
        double held = positions.getOrDefault(order.getSymbol(), 0.0);
        double qty = Math.min(order.getQuantity(), held);
        double notional = qty * order.getPrice();
        positions.put(order.getSymbol(), held - qty);
        double fee = notional * (feeBps / 10000.0);
        cash += (notional - fee);
        totalFees += fee;

        TradeOrder fill = new TradeOrder();
        fill.setSymbol(order.getSymbol());
        fill.setSide(TradeSide.SELL);
        fill.setPrice(order.getPrice());
        fill.setQuantity(qty);
        fill.setNotional(notional);
        fill.setFee(fee);
        filled.add(fill);
      }

      for (TradeOrder order : proposal.getOrders()) {
        if (order.getSide() != TradeSide.BUY) continue;
        double notional = order.getNotional();
        double fee = order.getFee();
        double cost = notional + fee;
        if (cash <= 1e-9) break;
        double qty = order.getQuantity();
        if (cost > cash) {
          double factor = cash / cost;
          qty *= factor;
          notional *= factor;
          fee *= factor;
          cost = notional + fee;
        }
        double held = positions.getOrDefault(order.getSymbol(), 0.0);
        positions.put(order.getSymbol(), held + qty);
        cash -= cost;
        totalFees += fee;

        TradeOrder fill = new TradeOrder();
        fill.setSymbol(order.getSymbol());
        fill.setSide(TradeSide.BUY);
        fill.setPrice(order.getPrice());
        fill.setQuantity(qty);
        fill.setNotional(notional);
        fill.setFee(fee);
        filled.add(fill);
      }

      acct.setCash(cash);
      acct.setPositions(positions);
      acct.setUpdatedAt(Instant.now());

      TradeExecution exec = new TradeExecution();
      exec.setExecutedAt(Instant.now());
      exec.setFilledOrders(filled);
      exec.setCashAfter(cash);
      exec.setPositionsAfter(new LinkedHashMap<>(positions));
      exec.setFeeTotal(totalFees);
      exec.setNote("Paper-trade execution filled at provided prices.");
      return exec;
    }
  }

  private PolicyCheck buildCheck(String name, boolean pass, String detail) {
    PolicyCheck check = new PolicyCheck();
    check.setName(name);
    check.setStatus(pass ? CheckStatus.PASS : CheckStatus.WARN);
    check.setDetail(detail);
    return check;
  }

  private AiRecommendation buildAiRecommendation(TradeProposalRequest req, TradeProposal proposal) {
    AiRecommendation ai = new AiRecommendation();
    double sharpeLike = proposal.getVariance() <= 1e-12 ? 0.0
        : proposal.getExpectedReturn() / Math.sqrt(proposal.getVariance());
    double confidence = 0.5 + 0.2 * Math.tanh(sharpeLike);
    confidence = Math.max(0.1, Math.min(0.9, confidence));

    ai.setConfidence(confidence);
    ai.setSummary("AI proposes a rebalance using " + (req.getMethod() == null ? Optimizers.Method.MEAN_VARIANCE_PGD : req.getMethod()).name()
        + " (" + proposal.getExecutionMode() + "). User confirmation required.");
    ai.getReasons().add("Expected return=" + round(proposal.getExpectedReturn(), 4));
    ai.getReasons().add("Variance=" + round(proposal.getVariance(), 4));
    ai.getReasons().add("Turnover=" + round(proposal.getTurnover(), 4));
    ai.getReasons().add("Platform fee=" + round(proposal.getFeeTotal(), 2));
    return ai;
  }

  private double round(double v, int places) {
    double pow = Math.pow(10, places);
    return Math.round(v * pow) / pow;
  }
}
