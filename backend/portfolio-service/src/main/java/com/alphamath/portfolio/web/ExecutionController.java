package com.alphamath.portfolio.web;

import com.alphamath.portfolio.execution.AssetClass;
import com.alphamath.portfolio.execution.BrokerAccount;
import com.alphamath.portfolio.execution.BrokerLinkRequest;
import com.alphamath.portfolio.execution.BrokerProviderInfo;
import com.alphamath.portfolio.execution.ExecutionIntent;
import com.alphamath.portfolio.execution.ExecutionService;
import com.alphamath.portfolio.execution.Region;
import com.alphamath.portfolio.trade.TradeProposal;
import com.alphamath.portfolio.trade.TradeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/execution")
public class ExecutionController {
  private final ExecutionService execution;
  private final TradeService trade;

  public ExecutionController(ExecutionService execution, TradeService trade) {
    this.execution = execution;
    this.trade = trade;
  }

  @GetMapping("/providers")
  public List<BrokerProviderInfo> providers(@RequestParam(required = false) Region region,
                                            @RequestParam(required = false) AssetClass assetClass) {
    return execution.listProviders(region, assetClass);
  }

  @GetMapping("/accounts")
  public List<BrokerAccount> accounts(Principal principal) {
    return execution.listAccounts(userId(principal));
  }

  @PostMapping("/accounts/link")
  public BrokerAccount link(@Valid @RequestBody BrokerLinkRequest req, Principal principal) {
    return execution.linkAccount(userId(principal), req);
  }

  @GetMapping("/intents")
  public List<ExecutionIntent> intents(Principal principal) {
    return execution.listIntents(userId(principal));
  }

  @GetMapping("/intents/{id}")
  public ExecutionIntent intent(@PathVariable String id, Principal principal) {
    return execution.getIntent(userId(principal), id);
  }

  @PostMapping("/intents/{proposalId}")
  public ExecutionIntent create(@PathVariable String proposalId, Principal principal) {
    TradeProposal proposal = trade.getProposal(userId(principal), proposalId);
    return execution.createIntent(userId(principal), proposal);
  }

  @PostMapping("/intents/{id}/simulate-fill")
  public ExecutionIntent simulateFill(@PathVariable String id, Principal principal) {
    return execution.simulateFill(userId(principal), id);
  }

  private String userId(Principal principal) {
    return principal == null ? "unknown" : principal.getName();
  }
}
