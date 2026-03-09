# Security Policy

## Supported Versions
Security fixes are applied to the default branch (`main`) and latest deployable Docker stack.

## Reporting a Vulnerability
Do **not** open public issues for vulnerabilities.

Report responsibly by sharing:
- Affected component(s)
- Reproduction steps / proof of concept
- Impact assessment
- Suggested remediation (if available)

Use private maintainer contact channels or private security reporting in the hosting platform.

## Security Controls in This Repository
- JWT-based gateway authentication with role propagation.
- Organization scoping and tenant context propagation (`X-Org-Id`).
- MFA support in auth flows.
- Audit event persistence and export.
- SCIM token hashing and SSO session expiry controls.

## Hardening Checklist
- Rotate JWT and SCIM secrets regularly.
- Enforce HTTPS and secure cookies in production.
- Restrict CORS origins and broker adapter credentials.
- Run dependency and container image vulnerability scans in CI.
- Enable database backups and encryption at rest.
