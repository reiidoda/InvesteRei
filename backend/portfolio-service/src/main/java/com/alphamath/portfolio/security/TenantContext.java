package com.alphamath.portfolio.security;

import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class TenantContext {
  public String getOrgId() {
    String authenticated = authenticatedOrgId();
    if (authenticated != null) {
      return authenticated;
    }
    String value = MDC.get("orgId");
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }

  private String authenticatedOrgId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null) {
      return null;
    }
    Object details = authentication.getDetails();
    if (!(details instanceof AuthenticatedRequestContext context)) {
      return null;
    }
    String orgId = context.orgId();
    if (orgId == null || orgId.isBlank()) {
      return null;
    }
    return orgId.trim();
  }
}
