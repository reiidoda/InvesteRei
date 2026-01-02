package com.alphamath.portfolio.execution;

import com.alphamath.portfolio.trade.TradeOrder;
import com.alphamath.portfolio.trade.TradeProposal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ExecutionService {
  private final Map<String, BrokerAccount> accounts = new ConcurrentHashMap<>();
  private final Map<String, ExecutionIntent> intents = new ConcurrentHashMap<>();
  private final List<BrokerProviderInfo> providers = initProviders();

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
    accounts.put(acct.getId(), acct);
    return acct;
  }

  public List<BrokerAccount> listAccounts(String userId) {
    List<BrokerAccount> out = new ArrayList<>();
    for (BrokerAccount acct : accounts.values()) {
      if (userId.equals(acct.getUserId())) out.add(acct);
    }
    return out;
  }

  public boolean hasLinkedAccount(String userId, Region region, AssetClass assetClass, String providerPreference) {
    for (BrokerAccount acct : accounts.values()) {
      if (!userId.equals(acct.getUserId())) continue;
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
      eo.setOrderType(proposal.getOrderType());
      eo.setTimeInForce(proposal.getTimeInForce());
      eo.setLimitPrice(proposal.getOrderType() == OrderType.LIMIT ? o.getPrice() : null);
      orders.add(eo);
    }
    intent.setOrders(orders);

    intents.put(intent.getId(), intent);
    return intent;
  }

  public ExecutionIntent getIntent(String userId, String id) {
    ExecutionIntent intent = intents.get(id);
    if (intent == null || !userId.equals(intent.getUserId())) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Execution intent not found");
    }
    return intent;
  }

  public List<ExecutionIntent> listIntents(String userId) {
    List<ExecutionIntent> out = new ArrayList<>();
    for (ExecutionIntent intent : intents.values()) {
      if (userId.equals(intent.getUserId())) out.add(intent);
    }
    return out;
  }

  public ExecutionIntent simulateFill(String userId, String id) {
    ExecutionIntent intent = getIntent(userId, id);
    intent.setStatus(ExecutionStatus.FILLED);
    intent.setNote("Simulated fill.");
    return intent;
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
    for (BrokerAccount acct : accounts.values()) {
      if (!userId.equals(acct.getUserId())) continue;
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
        List.of(AssetClass.EQUITY, AssetClass.ETF, AssetClass.FX, AssetClass.FIXED_INCOME),
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
        List.of(AssetClass.EQUITY, AssetClass.ETF),
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
}
