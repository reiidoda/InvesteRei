package com.alphamath.portfolio.web;

import com.alphamath.portfolio.trade.PaperAccount;
import com.alphamath.portfolio.trade.TradeDecisionRequest;
import com.alphamath.portfolio.trade.TradeProposal;
import com.alphamath.portfolio.trade.TradeProposalRequest;
import com.alphamath.portfolio.trade.TradeSeedRequest;
import com.alphamath.portfolio.trade.TradeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/trade")
public class TradeController {
  private final TradeService trade;

  public TradeController(TradeService trade) {
    this.trade = trade;
  }

  @GetMapping("/account")
  public PaperAccount account(Principal principal) {
    return trade.getAccount(userId(principal));
  }

  @PostMapping("/account/seed")
  public PaperAccount seed(@Valid @RequestBody TradeSeedRequest req, Principal principal) {
    return trade.seedAccount(userId(principal), req);
  }

  @PostMapping("/proposals")
  public TradeProposal propose(@Valid @RequestBody TradeProposalRequest req, Principal principal) {
    return trade.createProposal(userId(principal), req);
  }

  @GetMapping("/proposals/{id}")
  public TradeProposal proposal(@PathVariable String id, Principal principal) {
    return trade.getProposal(userId(principal), id);
  }

  @PostMapping("/proposals/{id}/decision")
  public TradeProposal decide(@PathVariable String id, @Valid @RequestBody TradeDecisionRequest req, Principal principal) {
    return trade.decide(userId(principal), id, req);
  }

  private String userId(Principal principal) {
    return principal == null ? "unknown" : principal.getName();
  }
}
