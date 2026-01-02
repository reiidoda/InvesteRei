package com.alphamath.portfolio.web;

import com.alphamath.portfolio.funding.FundingDepositReceipt;
import com.alphamath.portfolio.funding.FundingDepositRequest;
import com.alphamath.portfolio.funding.FundingLinkRequest;
import com.alphamath.portfolio.funding.FundingProviderInfo;
import com.alphamath.portfolio.funding.FundingService;
import com.alphamath.portfolio.funding.FundingSource;
import com.alphamath.portfolio.funding.FundingVerifyRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/funding")
public class FundingController {
  private final FundingService funding;

  public FundingController(FundingService funding) {
    this.funding = funding;
  }

  @GetMapping("/providers")
  public List<FundingProviderInfo> providers() {
    return funding.listProviders();
  }

  @GetMapping("/sources")
  public List<FundingSource> sources(Principal principal) {
    return funding.listSources(userId(principal));
  }

  @PostMapping("/sources")
  public FundingSource link(@Valid @RequestBody FundingLinkRequest req, Principal principal) {
    return funding.linkSource(userId(principal), req);
  }

  @PostMapping("/sources/{id}/verify")
  public FundingSource verify(@PathVariable String id, @RequestBody FundingVerifyRequest req, Principal principal) {
    return funding.verifySource(userId(principal), id, req);
  }

  @PostMapping("/deposits")
  public FundingDepositReceipt deposit(@Valid @RequestBody FundingDepositRequest req, Principal principal) {
    return funding.deposit(userId(principal), req);
  }

  @GetMapping("/deposits")
  public List<FundingDepositReceipt> deposits(Principal principal) {
    return funding.listDeposits(userId(principal));
  }

  private String userId(Principal principal) {
    return principal == null ? "unknown" : principal.getName();
  }
}
