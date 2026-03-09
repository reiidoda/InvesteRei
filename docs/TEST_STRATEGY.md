# Test Strategy

## Current Automated Checks
- Backend service build+tests (Maven):
  - `backend/auth-service`
  - `backend/portfolio-service`
  - `backend/simulation-service`
  - `backend/gateway`
- Web production build (Angular):
  - `frontend/web` via `npm run build`

## Recommended Test Layers
1. **Unit tests** for service-level business logic and validators.
2. **Repository tests** for user+org scoped query behavior.
3. **API contract tests** for critical workflows:
   - Auth + MFA
   - SSO callback handling
   - SCIM provisioning operations
   - Trade proposal/execution lifecycle
   - Auto-invest runs/fees/minimum balance checks
4. **End-to-end smoke tests** through gateway using Docker stack.

## Test Pyramid and Release Gate
```mermaid
flowchart TB
  subgraph Dev
    U["Unit Tests"]
    R["Repository/Integration Tests"]
    A["API Contract Tests"]
    E["End-to-End Smoke Tests"]
  end

  U --> R
  R --> A
  A --> E
  E --> GATE["Release Candidate Gate"]
  GATE --> REL["Tagged Release"]
```

## Org Security Regression Matrix
- Verify all org-scoped endpoints reject cross-org access.
- Verify admin endpoints require org admin/owner roles.
- Verify audit outputs remain tenant-scoped.

## Mobile/Web Validation
- Ensure key screens can load and submit against authenticated APIs.
- Keep route-to-endpoint coverage checklist synchronized with new modules.

## CI Recommendation
- Run Maven tests and Angular build on every PR.
- Add mobile static checks (`flutter analyze`, `flutter test`) where Flutter SDK is available.

## CI Pipeline Flow
```mermaid
sequenceDiagram
  autonumber
  participant PR as Pull Request
  participant CI as CI Pipeline
  participant BE as Backend Jobs
  participant FE as Frontend Jobs
  participant MOB as Mobile Jobs
  participant REL as Release

  PR->>CI: Trigger checks
  CI->>BE: mvn test (all services)
  CI->>FE: npm run build (web)
  CI->>MOB: flutter analyze + flutter test
  BE-->>CI: pass/fail
  FE-->>CI: pass/fail
  MOB-->>CI: pass/fail
  CI-->>REL: Eligible only if all required jobs pass
```
