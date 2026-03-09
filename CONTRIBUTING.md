# Contributing to InvesteRei

## Development Principles
- Keep changes small, testable, and reversible.
- Preserve tenant/org isolation, auditability, and deterministic behavior.
- Prefer explicit contracts (DTOs, enums, validation) over implicit assumptions.
- Keep backwards compatibility for public API routes unless explicitly versioned.

## Local Setup
1. Start infrastructure and services:
```bash
make up
```
2. Run backend tests:
```bash
cd backend/auth-service && mvn test
cd ../portfolio-service && mvn test
cd ../simulation-service && mvn test
cd ../gateway && mvn test
```
3. Build web app:
```bash
cd frontend/web && npm install && npm run build
```

## Pull Request Expectations
- Explain **what** changed and **why**.
- Include test evidence (command + result).
- Call out config/migration changes explicitly.
- Avoid unrelated formatting churn.

## Coding Standards
- Java: Spring Boot style, constructor injection, explicit validation and HTTP errors.
- Flutter/Angular: keep state handling clear and API failures user-visible.
- SQL/Flyway: additive-first migrations with safe defaults.

## Commit Guidance
- Use meaningful, scoped commit messages.
- Group related code, tests, and docs in the same commit.
- Do not rewrite shared history in this project.
