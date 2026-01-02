package com.alphamath.portfolio.compliance;

import com.alphamath.portfolio.trade.CheckStatus;
import com.alphamath.portfolio.trade.PolicyCheck;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ComplianceService {
  private final Map<String, ComplianceProfile> profiles = new ConcurrentHashMap<>();

  public ComplianceProfile getProfile(String userId) {
    return profiles.computeIfAbsent(userId, id -> new ComplianceProfile());
  }

  public ComplianceProfile updateProfile(String userId, ComplianceUpdateRequest req) {
    ComplianceProfile profile = getProfile(userId);
    if (req.getKycStatus() != null) profile.setKycStatus(req.getKycStatus());
    if (req.getAmlStatus() != null) profile.setAmlStatus(req.getAmlStatus());
    if (req.getSuitabilityStatus() != null) profile.setSuitabilityStatus(req.getSuitabilityStatus());
    if (req.getRiskProfile() != null) profile.setRiskProfile(req.getRiskProfile());
    if (req.getAccountType() != null) profile.setAccountType(req.getAccountType());
    if (req.getTaxResidency() != null) profile.setTaxResidency(req.getTaxResidency());
    if (req.getAccreditedInvestor() != null) profile.setAccreditedInvestor(req.getAccreditedInvestor());
    if (req.getRestrictions() != null) profile.setRestrictions(new ArrayList<>(req.getRestrictions()));
    profile.setUpdatedAt(Instant.now());
    profiles.put(userId, profile);
    return profile;
  }

  public List<PolicyCheck> complianceChecks(String userId) {
    ComplianceProfile profile = getProfile(userId);
    List<PolicyCheck> checks = new ArrayList<>();
    checks.add(check("KYC", profile.getKycStatus() == KycStatus.VERIFIED,
        "Status=" + profile.getKycStatus()));
    checks.add(check("AML", profile.getAmlStatus() == AmlStatus.PASSED,
        "Status=" + profile.getAmlStatus()));
    checks.add(check("Suitability", profile.getSuitabilityStatus() == SuitabilityStatus.SUITABLE,
        "Status=" + profile.getSuitabilityStatus()));
    if (!profile.getRestrictions().isEmpty()) {
      checks.add(check("Restrictions", false, "Restrictions=" + profile.getRestrictions()));
    } else {
      checks.add(check("Restrictions", true, "No restrictions"));
    }
    return checks;
  }

  public void requireLiveEligibility(String userId) {
    ComplianceProfile profile = getProfile(userId);
    if (profile.getKycStatus() != KycStatus.VERIFIED) {
      throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "KYC not verified");
    }
    if (profile.getAmlStatus() != AmlStatus.PASSED) {
      throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "AML not cleared");
    }
    if (profile.getSuitabilityStatus() != SuitabilityStatus.SUITABLE) {
      throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "Suitability not cleared");
    }
    if (!profile.getRestrictions().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "Account has restrictions");
    }
  }

  private PolicyCheck check(String name, boolean pass, String detail) {
    PolicyCheck c = new PolicyCheck();
    c.setName(name);
    c.setStatus(pass ? CheckStatus.PASS : CheckStatus.FAIL);
    c.setDetail(detail);
    return c;
  }
}
