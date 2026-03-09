package com.alphamath.portfolio.web;

import com.alphamath.portfolio.application.reporting.OrgAdminReportingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/org")
public class OrgAdminController {
  private final OrgAdminReportingService reporting;
  private final SecurityGuard security;

  public OrgAdminController(OrgAdminReportingService reporting, SecurityGuard security) {
    this.reporting = reporting;
    this.security = security;
  }

  @GetMapping("/summary")
  public Map<String, Object> summary(@RequestHeader(value = "X-Org-Roles", required = false) String orgRoles) {
    security.requireRole(orgRoles, "OWNER", "ADMIN");
    return reporting.summary();
  }

  @GetMapping("/audit/events")
  public List<Map<String, Object>> auditEvents(@RequestHeader(value = "X-Org-Roles", required = false) String orgRoles,
                                               @RequestParam(required = false, defaultValue = "50") Integer limit) {
    security.requireRole(orgRoles, "OWNER", "ADMIN");
    return reporting.recentAudit(limit == null ? 50 : limit);
  }
}
