# Open Source Roadmap

This roadmap aligns product parity work, enterprise hardening, and open-source delivery quality.

## Release Streams
- Stream A: Core platform reliability and security.
- Stream B: Enterprise identity and org governance.
- Stream C: Banking + investing parity features.
- Stream D: Developer experience, docs, and quality automation.

## Timeline
```mermaid
gantt
  title InvesteRei Enterprise Roadmap
  dateFormat  YYYY-MM-DD
  section Foundations
  Architecture Baseline and ADRs         :a1, 2026-03-10, 2026-03-28
  Quality Gates and Test Harness         :a2, 2026-03-20, 2026-04-20

  section Identity and Security
  SSO and SCIM Hardening                 :b1, 2026-04-01, 2026-05-10
  Org Scope Authorization Regression     :b2, 2026-04-15, 2026-05-20

  section Product Parity
  Banking + Research + Wealth Plan       :c1, 2026-05-01, 2026-06-20
  Mobile Parity and E2E Coverage         :c2, 2026-05-15, 2026-06-30

  section Scale and Operations
  Event-driven Data Integration          :d1, 2026-06-01, 2026-07-15
  Performance and Cost Optimization      :d2, 2026-06-15, 2026-07-30
```

## Milestone Backlog

### M1: Engineering Baseline
- Complete architecture, HLD, LLD, UML, and requirements documentation.
- Define API governance and schema migration standards.
- Introduce CI gates for backend build and frontend/mobile build checks.

### M2: Enterprise Security and Identity
- Complete OIDC/SAML edge-case coverage.
- Complete SCIM create/update/deactivate + group membership tests.
- Add tenant isolation security matrix to CI.

### M3: Product Completion
- Harden trade lifecycle and proposal decision flows.
- Complete banking instant transfer and wealth plan reliability tests.
- Ensure mobile parity for all critical enterprise screens.

### M4: Scalability and Operations
- Introduce event contracts and outbox-based propagation.
- Add observability SLOs, runbooks, and incident management workflows.
- Add cost-aware scaling policies and benchmark suite.

## Delivery Governance
- Every milestone requires a release readiness review.
- Every major architecture change requires an ADR.
- Every critical endpoint requires contract + authorization tests.

## Existing Public Tracking
Live milestone/issues mapping remains in GitHub issues for `reiidoda/InvesteRei`.
