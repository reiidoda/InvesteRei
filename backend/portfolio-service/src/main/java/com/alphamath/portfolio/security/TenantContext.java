package com.alphamath.portfolio.security;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;

@Component
public class TenantContext {
  public String getOrgId() {
    String value = MDC.get("orgId");
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }
}
