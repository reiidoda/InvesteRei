package com.alphamath.portfolio.web;

import com.alphamath.portfolio.compliance.ComplianceProfile;
import com.alphamath.portfolio.compliance.ComplianceService;
import com.alphamath.portfolio.compliance.ComplianceUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/compliance")
public class ComplianceController {
  private final ComplianceService compliance;

  public ComplianceController(ComplianceService compliance) {
    this.compliance = compliance;
  }

  @GetMapping("/profile")
  public ComplianceProfile profile(Principal principal) {
    return compliance.getProfile(userId(principal));
  }

  @PostMapping("/profile")
  public ComplianceProfile update(@Valid @RequestBody ComplianceUpdateRequest req, Principal principal) {
    return compliance.updateProfile(userId(principal), req);
  }

  private String userId(Principal principal) {
    return principal == null ? "unknown" : principal.getName();
  }
}
