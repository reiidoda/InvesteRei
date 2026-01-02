package com.alphamath.portfolio.funding;

import com.alphamath.portfolio.trade.PaperAccount;
import com.alphamath.portfolio.trade.TradeService;
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
public class FundingService {
  private final TradeService trade;
  private final Map<String, Map<String, FundingSource>> sources = new ConcurrentHashMap<>();
  private final Map<String, FundingDepositReceipt> deposits = new ConcurrentHashMap<>();

  public FundingService(TradeService trade) {
    this.trade = trade;
  }

  public List<FundingProviderInfo> listProviders() {
    List<FundingProviderInfo> out = new ArrayList<>();
    out.add(provider("stripe", "Stripe", List.of(FundingMethodType.CARD), List.of("tokenized_card"), "Global"));
    out.add(provider("adyen", "Adyen", List.of(FundingMethodType.CARD), List.of("tokenized_card"), "Global"));
    out.add(provider("plaid", "Plaid", List.of(FundingMethodType.BANK_ACH, FundingMethodType.BANK_ACCOUNT), List.of("oauth", "micro_deposit"), "US/CA/EU"));
    out.add(provider("dwolla", "Dwolla", List.of(FundingMethodType.BANK_ACH), List.of("micro_deposit"), "US"));
    out.add(provider("wise", "Wise", List.of(FundingMethodType.BANK_WIRE), List.of("wire_reference"), "Global"));
    out.add(provider("paypal", "PayPal", List.of(FundingMethodType.PAYPAL), List.of("oauth"), "Global"));
    out.add(provider("coinbase", "Coinbase", List.of(FundingMethodType.CRYPTO), List.of("wallet_connect"), "Global"));
    out.add(provider("fireblocks", "Fireblocks", List.of(FundingMethodType.CRYPTO), List.of("wallet_whitelist"), "Enterprise"));
    return out;
  }

  public List<FundingSource> listSources(String userId) {
    return new ArrayList<>(userSources(userId).values());
  }

  public FundingSource linkSource(String userId, FundingLinkRequest req) {
    if (req.getMethodType() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "methodType is required");
    }
    FundingSource source = new FundingSource();
    source.setId(UUID.randomUUID().toString());
    source.setUserId(userId);
    source.setMethodType(req.getMethodType());
    source.setProviderId(req.getProviderId());
    source.setLabel(req.getLabel());
    source.setLast4(req.getLast4() == null ? "0000" : req.getLast4());
    source.setCurrency(req.getCurrency() == null ? "USD" : req.getCurrency());
    source.setNetwork(req.getNetwork());
    source.setCreatedAt(Instant.now());

    FundingStatus status = switch (req.getMethodType()) {
      case CARD, PAYPAL, CRYPTO -> FundingStatus.VERIFIED;
      default -> FundingStatus.PENDING_VERIFICATION;
    };
    source.setStatus(status);

    userSources(userId).put(source.getId(), source);
    return source;
  }

  public FundingSource verifySource(String userId, String id, FundingVerifyRequest req) {
    FundingSource source = getSource(userId, id);
    if (source.getStatus() == FundingStatus.DISABLED) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Source disabled");
    }
    source.setStatus(FundingStatus.VERIFIED);
    return source;
  }

  public FundingDepositReceipt deposit(String userId, FundingDepositRequest req) {
    FundingSource source = getSource(userId, req.getSourceId());
    if (source.getStatus() != FundingStatus.VERIFIED) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Source not verified");
    }
    double amount = req.getAmount() == null ? 0.0 : req.getAmount();
    if (amount <= 0.0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount must be > 0");
    }

    PaperAccount acct = trade.getAccount(userId);
    synchronized (acct) {
      acct.setCash(acct.getCash() + amount);
      acct.setUpdatedAt(Instant.now());
    }

    FundingDepositReceipt receipt = new FundingDepositReceipt();
    receipt.setId(UUID.randomUUID().toString());
    receipt.setUserId(userId);
    receipt.setSourceId(source.getId());
    receipt.setAmount(amount);
    receipt.setStatus("COMPLETED");
    receipt.setNote("Paper deposit credited to cash balance.");
    receipt.setCreatedAt(Instant.now());
    deposits.put(receipt.getId(), receipt);
    return receipt;
  }

  public List<FundingDepositReceipt> listDeposits(String userId) {
    List<FundingDepositReceipt> out = new ArrayList<>();
    for (FundingDepositReceipt r : deposits.values()) {
      if (userId.equals(r.getUserId())) out.add(r);
    }
    return out;
  }

  private FundingSource getSource(String userId, String id) {
    FundingSource source = userSources(userId).get(id);
    if (source == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Source not found");
    }
    return source;
  }

  private Map<String, FundingSource> userSources(String userId) {
    return sources.computeIfAbsent(userId, id -> new LinkedHashMap<>());
  }

  private FundingProviderInfo provider(String id, String name, List<FundingMethodType> methods, List<String> verification, String regions) {
    FundingProviderInfo info = new FundingProviderInfo();
    info.setId(id);
    info.setDisplayName(name);
    info.setMethods(new ArrayList<>(methods));
    info.setVerificationModes(new ArrayList<>(verification));
    info.setRegions(List.of(regions));
    info.setNotes("Scaffold only. No live money movement.");
    return info;
  }
}
