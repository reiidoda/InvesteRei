package com.alphamath.portfolio.application.execution;

import com.alphamath.portfolio.application.audit.AuditService;
import com.alphamath.portfolio.domain.execution.AssetClass;
import com.alphamath.portfolio.domain.execution.BrokerAccount;
import com.alphamath.portfolio.domain.execution.BrokerAccountStatus;
import com.alphamath.portfolio.domain.execution.BrokerLinkRequest;
import com.alphamath.portfolio.domain.execution.BrokerProviderInfo;
import com.alphamath.portfolio.domain.execution.ExecutionIntent;
import com.alphamath.portfolio.domain.execution.ExecutionOrder;
import com.alphamath.portfolio.domain.execution.ExecutionStatus;
import com.alphamath.portfolio.domain.execution.OrderType;
import com.alphamath.portfolio.domain.execution.Region;
import com.alphamath.portfolio.domain.trade.TradeOrder;
import com.alphamath.portfolio.domain.trade.TradeProposal;
import com.alphamath.portfolio.infrastructure.persistence.BrokerAccountEntity;
import com.alphamath.portfolio.infrastructure.persistence.BrokerAccountRepository;
import com.alphamath.portfolio.infrastructure.persistence.ExecutionFillEntity;
import com.alphamath.portfolio.infrastructure.persistence.ExecutionFillRepository;
import com.alphamath.portfolio.infrastructure.persistence.ExecutionIntentEntity;
import com.alphamath.portfolio.infrastructure.persistence.ExecutionIntentRepository;
import com.alphamath.portfolio.infrastructure.persistence.JsonUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ExecutionService {
  private final List<BrokerProviderInfo> providers = initProviders();
  private final BrokerAccountRepository accounts;
  private final ExecutionIntentRepository intents;
  private final ExecutionFillRepository fills;
  private final AuditService audit;

  public ExecutionService(BrokerAccountRepository accounts,
                          ExecutionIntentRepository intents,
                          ExecutionFillRepository fills,
                          AuditService audit) {
    this.accounts = accounts;
    this.intents = intents;
    this.fills = fills;
    this.audit = audit;
  }

  public List<BrokerProviderInfo> listProviders(Region region, AssetClass assetClass) {
    if (region == null && assetClass == null) return new ArrayList<>(providers);

    List<BrokerProviderInfo> out = new ArrayList<>();
    for (BrokerProviderInfo p : providers) {
      if (region != null && !p.getRegions().contains(region)) continue;
      if (assetClass != null && !p.getAssetClasses().contains(assetClass)) continue;
      out.add(p);
    }
    out.sort(Comparator.comparingInt(BrokerProviderInfo::getScore).reversed());
    return out;
  }

  public BrokerAccount linkAccount(String userId, BrokerLinkRequest req) {
    BrokerProviderInfo provider = findProvider(req.getProviderId());
    BrokerAccount acct = new BrokerAccount();
    acct.setId(UUID.randomUUID().toString());
    acct.setUserId(userId);
    acct.setProviderId(provider.getId());
    acct.setProviderName(provider.getDisplayName());
    acct.setRegion(req.getRegion());
    acct.setAssetClasses(req.getAssetClasses().isEmpty() ? provider.getAssetClasses() : req.getAssetClasses());
    acct.setStatus(BrokerAccountStatus.LINKED);
    acct.setCreatedAt(Instant.now());
    accounts.save(toEntity(acct));

    audit.record(userId, userId, "BROKER_LINKED", "portfolio_broker_account", acct.getId(),
        Map.of("providerId", acct.getProviderId(), "region", acct.getRegion().name()));
    return acct;
  }

  public List<BrokerAccount> listAccounts(String userId) {
    List<BrokerAccount> out = new ArrayList<>();
    for (BrokerAccountEntity entity : accounts.findByUserIdOrderByCreatedAtDesc(userId)) {
      out.add(toDto(entity));
    }
    return out;
  }

  public boolean hasLinkedAccount(String userId, Region region, AssetClass assetClass, String providerPreference) {
    for (BrokerAccountEntity entity : accounts.findByUserIdOrderByCreatedAtDesc(userId)) {
      BrokerAccount acct = toDto(entity);
      if (providerPreference != null && !providerPreference.isBlank() && !acct.getProviderId().equals(providerPreference)) {
        continue;
      }
      if (region != null && acct.getRegion() != region) continue;
      if (assetClass != null && !acct.getAssetClasses().contains(assetClass)) continue;
      if (acct.getStatus() == BrokerAccountStatus.LINKED) return true;
    }
    return false;
  }

  public ExecutionIntent createIntent(String userId, TradeProposal proposal) {
    BrokerProviderInfo provider = selectProvider(proposal.getProviderPreference(), proposal.getRegion(), proposal.getAssetClass());
    BrokerAccount acct = findLinkedAccount(userId, provider.getId(), proposal.getRegion(), proposal.getAssetClass());

    ExecutionIntent intent = new ExecutionIntent();
    intent.setId(UUID.randomUUID().toString());
    intent.setUserId(userId);
    intent.setProposalId(proposal.getId());
    intent.setProviderId(provider.getId());
    intent.setProviderName(provider.getDisplayName());
    intent.setRegion(proposal.getRegion());
    intent.setAssetClass(proposal.getAssetClass());
    intent.setStatus(ExecutionStatus.SUBMITTED);
    intent.setCreatedAt(Instant.now());
    intent.setNote("Live execution scaffold. Orders submitted to " + acct.getProviderName() + ".");

    List<ExecutionOrder> orders = new ArrayList<>();
    for (TradeOrder o : proposal.getOrders()) {
      ExecutionOrder eo = new ExecutionOrder();
      eo.setSymbol(o.getSymbol());
      eo.setSide(o.getSide());
      eo.setQuantity(o.getQuantity());
      eo.setPrice(o.getPrice());
      eo.setOrderType(proposal.getOrderType());
      eo.setTimeInForce(proposal.getTimeInForce());
      eo.setLimitPrice(proposal.getOrderType() == OrderType.LIMIT ? o.getPrice() : null);
      orders.add(eo);
    }
    intent.setOrders(orders);

    intents.save(toEntity(intent));
    audit.record(userId, userId, "EXECUTION_INTENT_CREATED", "portfolio_execution_intent", intent.getId(),
        Map.of("proposalId", proposal.getId(), "orderCount", orders.size()));
    return intent;
  }

  public ExecutionIntent getIntent(String userId, String id) {
    ExecutionIntentEntity entity = intents.findById(id).orElse(null);
    if (entity == null || !userId.equals(entity.getUserId())) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Execution intent not found");
    }
    return toDto(entity);
  }

  public List<ExecutionIntent> listIntents(String userId) {
    List<ExecutionIntent> out = new ArrayList<>();
    for (ExecutionIntentEntity entity : intents.findByUserIdOrderByCreatedAtDesc(userId)) {
      out.add(toDto(entity));
    }
    return out;
  }

  public ExecutionIntent simulateFill(String userId, String id) {
    ExecutionIntentEntity entity = intents.findById(id).orElse(null);
    if (entity == null || !userId.equals(entity.getUserId())) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Execution intent not found");
    }
    if (entity.getStatus() == ExecutionStatus.FILLED) {
      return toDto(entity);
    }

    entity.setStatus(ExecutionStatus.FILLED);
    entity.setNote("Simulated fill.");
    intents.save(entity);

    List<ExecutionOrder> orders = JsonUtils.fromJson(entity.getOrdersJson(), new TypeReference<List<ExecutionOrder>>() {});
    Instant now = Instant.now();
    List<ExecutionFillEntity> fillRows = new ArrayList<>();
    for (ExecutionOrder order : orders) {
      ExecutionFillEntity fill = new ExecutionFillEntity();
      fill.setId(UUID.randomUUID().toString());
      fill.setIntentId(entity.getId());
      fill.setUserId(entity.getUserId());
      fill.setProposalId(entity.getProposalId());
      fill.setSymbol(order.getSymbol());
      fill.setSide(order.getSide().name());
      fill.setQuantity(order.getQuantity());
      double price = order.getLimitPrice() != null ? order.getLimitPrice() : (order.getPrice() == null ? 0.0 : order.getPrice());
      fill.setPrice(price);
      fill.setFee(0.0);
      fill.setStatus(ExecutionStatus.FILLED.name());
      fill.setFilledAt(now);
      fill.setCreatedAt(now);
      fill.setNote("Simulated fill.");
      fillRows.add(fill);
    }
    fills.saveAll(fillRows);
    audit.record(userId, userId, "EXECUTION_FILLED", "portfolio_execution_intent", entity.getId(),
        Map.of("fills", fillRows.size()));
    return toDto(entity);
  }

  private BrokerProviderInfo selectProvider(String preference, Region region, AssetClass assetClass) {
    if (preference != null && !preference.isBlank()) {
      return findProvider(preference);
    }
    List<BrokerProviderInfo> candidates = listProviders(region, assetClass);
    if (candidates.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No providers for region/asset class");
    }
    return candidates.get(0);
  }

  private BrokerAccount findLinkedAccount(String userId, String providerId, Region region, AssetClass assetClass) {
    for (BrokerAccountEntity entity : accounts.findByUserIdOrderByCreatedAtDesc(userId)) {
      BrokerAccount acct = toDto(entity);
      if (!acct.getProviderId().equals(providerId)) continue;
      if (region != null && acct.getRegion() != region) continue;
      if (assetClass != null && !acct.getAssetClasses().contains(assetClass)) continue;
      if (acct.getStatus() == BrokerAccountStatus.LINKED) return acct;
    }
    throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "Broker account not linked");
  }

  private BrokerProviderInfo findProvider(String id) {
    for (BrokerProviderInfo info : providers) {
      if (info.getId().equals(id)) return info;
    }
    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found");
  }

  private List<BrokerProviderInfo> initProviders() {
    List<BrokerProviderInfo> out = new ArrayList<>();
    out.add(provider("interactive_brokers", "Interactive Brokers",
        List.of(Region.US, Region.EU, Region.UK, Region.APAC),
        List.of(AssetClass.EQUITY, AssetClass.ETF, AssetClass.FX, AssetClass.FIXED_INCOME, AssetClass.OPTIONS,
            AssetClass.FUTURES, AssetClass.COMMODITIES),
        List.of("global_access", "multi_asset", "prime_execution"), 95));
    out.add(provider("apex", "Apex Clearing",
        List.of(Region.US),
        List.of(AssetClass.EQUITY, AssetClass.ETF),
        List.of("clearing", "fractional_shares"), 90));
    out.add(provider("drivewealth", "DriveWealth",
        List.of(Region.US, Region.EU, Region.LATAM),
        List.of(AssetClass.EQUITY, AssetClass.ETF),
        List.of("global_fractional", "broker_api"), 88));
    out.add(provider("alpaca", "Alpaca",
        List.of(Region.US),
        List.of(AssetClass.EQUITY, AssetClass.ETF),
        List.of("commission_free", "paper_trading"), 80));
    out.add(provider("tradier", "Tradier",
        List.of(Region.US),
        List.of(AssetClass.EQUITY, AssetClass.ETF, AssetClass.OPTIONS),
        List.of("options_support"), 78));
    out.add(provider("coinbase_prime", "Coinbase Prime",
        List.of(Region.GLOBAL),
        List.of(AssetClass.CRYPTO),
        List.of("institutional_custody", "best_execution"), 92));
    out.add(provider("fireblocks", "Fireblocks",
        List.of(Region.GLOBAL),
        List.of(AssetClass.CRYPTO),
        List.of("institutional_custody", "policy_engine"), 90));
    out.add(provider("kraken", "Kraken",
        List.of(Region.GLOBAL),
        List.of(AssetClass.CRYPTO),
        List.of("deep_liquidity"), 85));
    out.sort(Comparator.comparingInt(BrokerProviderInfo::getScore).reversed());
    return out;
  }

  private BrokerProviderInfo provider(String id, String name, List<Region> regions, List<AssetClass> assets,
                                      List<String> features, int score) {
    BrokerProviderInfo info = new BrokerProviderInfo();
    info.setId(id);
    info.setDisplayName(name);
    info.setRegions(new ArrayList<>(regions));
    info.setAssetClasses(new ArrayList<>(assets));
    info.setFeatures(new ArrayList<>(features));
    info.setScore(score);
    info.setNotes("Scaffold only. Live execution requires provider integration and approvals.");
    return info;
  }

  private BrokerAccountEntity toEntity(BrokerAccount acct) {
    BrokerAccountEntity entity = new BrokerAccountEntity();
    entity.setId(acct.getId());
    entity.setUserId(acct.getUserId());
    entity.setProviderId(acct.getProviderId());
    entity.setProviderName(acct.getProviderName());
    entity.setBrokerConnectionId(acct.getBrokerConnectionId());
    entity.setExternalAccountId(acct.getExternalAccountId());
    entity.setAccountNumber(acct.getAccountNumber());
    entity.setBaseCurrency(acct.getBaseCurrency());
    entity.setAccountType(acct.getAccountType());
    entity.setRegion(acct.getRegion());
    entity.setAssetClassesJson(JsonUtils.toJson(acct.getAssetClasses()));
    entity.setPermissionsJson(JsonUtils.toJson(acct.getPermissions()));
    entity.setBalancesJson(JsonUtils.toJson(acct.getBalances()));
    entity.setStatus(acct.getStatus());
    entity.setCreatedAt(acct.getCreatedAt());
    entity.setUpdatedAt(acct.getUpdatedAt());
    return entity;
  }

  private BrokerAccount toDto(BrokerAccountEntity entity) {
    BrokerAccount acct = new BrokerAccount();
    acct.setId(entity.getId());
    acct.setUserId(entity.getUserId());
    acct.setProviderId(entity.getProviderId());
    acct.setProviderName(entity.getProviderName());
    acct.setBrokerConnectionId(entity.getBrokerConnectionId());
    acct.setExternalAccountId(entity.getExternalAccountId());
    acct.setAccountNumber(entity.getAccountNumber());
    acct.setBaseCurrency(entity.getBaseCurrency());
    acct.setAccountType(entity.getAccountType());
    acct.setRegion(entity.getRegion());
    acct.setAssetClasses(JsonUtils.fromJson(entity.getAssetClassesJson(), new TypeReference<List<AssetClass>>() {}));
    acct.setPermissions(parseStringList(entity.getPermissionsJson()));
    acct.setBalances(parseBalances(entity.getBalancesJson()));
    acct.setStatus(entity.getStatus());
    acct.setCreatedAt(entity.getCreatedAt());
    acct.setUpdatedAt(entity.getUpdatedAt());
    return acct;
  }

  private List<String> parseStringList(String json) {
    if (json == null || json.isBlank()) return new ArrayList<>();
    try {
      return JsonUtils.fromJson(json, new TypeReference<List<String>>() {});
    } catch (Exception e) {
      return new ArrayList<>();
    }
  }

  private Map<String, Double> parseBalances(String json) {
    if (json == null || json.isBlank()) return new LinkedHashMap<>();
    try {
      return JsonUtils.fromJson(json, new TypeReference<Map<String, Double>>() {});
    } catch (Exception e) {
      return new LinkedHashMap<>();
    }
  }

  private ExecutionIntentEntity toEntity(ExecutionIntent intent) {
    ExecutionIntentEntity entity = new ExecutionIntentEntity();
    entity.setId(intent.getId());
    entity.setUserId(intent.getUserId());
    entity.setProposalId(intent.getProposalId());
    entity.setProviderId(intent.getProviderId());
    entity.setProviderName(intent.getProviderName());
    entity.setRegion(intent.getRegion());
    entity.setAssetClass(intent.getAssetClass());
    entity.setStatus(intent.getStatus());
    entity.setCreatedAt(intent.getCreatedAt());
    entity.setNote(intent.getNote());
    entity.setOrdersJson(JsonUtils.toJson(intent.getOrders()));
    return entity;
  }

  private ExecutionIntent toDto(ExecutionIntentEntity entity) {
    ExecutionIntent intent = new ExecutionIntent();
    intent.setId(entity.getId());
    intent.setUserId(entity.getUserId());
    intent.setProposalId(entity.getProposalId());
    intent.setProviderId(entity.getProviderId());
    intent.setProviderName(entity.getProviderName());
    intent.setRegion(entity.getRegion());
    intent.setAssetClass(entity.getAssetClass());
    intent.setStatus(entity.getStatus());
    intent.setCreatedAt(entity.getCreatedAt());
    intent.setNote(entity.getNote());
    intent.setOrders(JsonUtils.fromJson(entity.getOrdersJson(), new TypeReference<List<ExecutionOrder>>() {}));
    return intent;
  }
}
