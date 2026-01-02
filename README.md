# InvesteRei Enterprise (Monorepo)

A Big-Tech style, **simulation-first** platform that helps users make smarter money decisions with math + AI — without giving buy/sell recommendations.

## What this is (and what it isn't)
- ✅ Education, scenario modeling, backtesting/paper trading, portfolio optimization under constraints, risk analytics.
- ✅ AI explanations: *why* the numbers look the way they do.
- ❌ No personalized “buy X now” financial advice.

## Architecture (Enterprise)
- **Gateway**: Spring Cloud Gateway (routing, JWT validation, rate limiting placeholders)
- **Auth Service**: User registration/login, JWT issuance
- **Portfolio Service**: Optimization + risk metrics APIs (mean-variance + constraints; MVP uses robust heuristics)
- **Simulation Service (placeholder)**: Backtesting jobs + results (skeleton)
- **Postgres**: Primary persistence
- **Redis**: Optional cache/job queue

Frontend:
- **Angular 17** (standalone components) with an enterprise feature-based structure

---

## Quick start (Docker)
1) Install Docker + Docker Compose.
2) From repo root:

```bash
docker compose up --build
```

- Web: http://localhost:4200
- Gateway: http://localhost:8080
- Auth: http://localhost:8081 (internal)
- Portfolio: http://localhost:8082 (internal)

---

## API overview (via Gateway)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/portfolio/optimize` (requires Bearer token)

---

## Next steps
- Replace heuristic optimizer with quadratic programming (e.g., ojAlgo / OR-Tools / custom solver).
- Add market-data ingestion and historical dataset store.
- Implement simulation jobs (Celery-like queue pattern in Java with Spring Batch or Quartz).
- Add “AI Coach” service (RAG over your docs + user simulations), with strict safety guardrails.


## Math Engine Coverage
This repo includes a **broad, extensible math engine**: mean–variance optimization, risk parity, Kelly (approx), Black–Litterman (posterior), covariance estimators (sample/EWMA/shrinkage), and advanced risk metrics (Sharpe/Sortino/Drawdown/VaR/CVaR/Cornish–Fisher, etc.).

> Note: mathematics for investing is effectively unbounded. The project is structured so new models/formulas can be added as modules without breaking the API.


## Living Library (Everything Ever Published)
A static repository can never contain *all* formulas ever published. InvesteRei includes a **Living Math Library** (`math-library/`) with a registry + plugin interfaces so the system can continuously expand.


## Continuous Ingestion
A scheduled GitHub Action ingests new arXiv paper metadata into `math-library/papers/inbox/` and opens a PR daily. See `math-library/ingestion/README.md`.
