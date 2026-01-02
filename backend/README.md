# Backend (Spring Boot microservices)

All services are independent Docker builds to avoid requiring Gradle installed locally.

Services:
- gateway (8080)
- auth-service (8081)
- portfolio-service (8082)
- simulation-service (placeholder, not wired)

Shared:
- common library (DTOs, errors, conventions)

Security:
- auth-service issues JWT (HMAC secret)
- gateway validates JWT for protected routes
- downstream services optionally validate too (portfolio does validate)

