package com.alphamath.portfolio.web;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Component
public class SecurityGuard {
  private final SecurityPolicyProperties properties;

  public SecurityGuard(SecurityPolicyProperties properties) {
    this.properties = properties;
  }

  public void requireMfa(String mfaHeader, String reason) {
    if (properties == null || properties.getMfa() == null || !properties.getMfa().isEnforce()) {
      return;
    }
    if (!isMfaVerified(mfaHeader)) {
      String message = reason == null || reason.isBlank()
          ? "MFA required"
          : "MFA required for " + reason;
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
  }

  public void requireRole(String rolesHeader, String... allowedRoles) {
    if (properties == null || properties.getRbac() == null || !properties.getRbac().isEnforce()) {
      return;
    }
    if (!hasAnyRole(rolesHeader, allowedRoles)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient role");
    }
  }

  private boolean isMfaVerified(String header) {
    if (header == null || header.isBlank()) {
      return false;
    }
    String normalized = header.trim().toLowerCase(Locale.US);
    return normalized.equals("true")
        || normalized.equals("1")
        || normalized.equals("yes")
        || normalized.equals("verified");
  }

  private boolean hasAnyRole(String header, String... allowedRoles) {
    if (allowedRoles == null || allowedRoles.length == 0) {
      return true;
    }
    if (header == null || header.isBlank()) {
      return false;
    }
    Set<String> roles = new HashSet<>();
    for (String part : header.split(",")) {
      if (part == null) continue;
      String normalized = part.trim().toUpperCase(Locale.US);
      if (!normalized.isEmpty()) {
        roles.add(normalized);
      }
    }
    if (roles.isEmpty()) {
      return false;
    }
    for (String allowed : allowedRoles) {
      if (allowed == null) continue;
      String normalized = allowed.trim().toUpperCase(Locale.US);
      if (!normalized.isEmpty() && roles.contains(normalized)) {
        return true;
      }
    }
    return false;
  }
}
