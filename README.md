![InvesteRei Monochrome Banner](branding/readme-banner.png)

# InvesteRei — AI Automated Investing, with Your Approval

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache%202.0-black.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/reiidoda/InvesteRei?style=flat&color=black)](https://github.com/reiidoda/InvesteRei/stargazers)
[![Forks](https://img.shields.io/github/forks/reiidoda/InvesteRei?style=flat&color=black)](https://github.com/reiidoda/InvesteRei/network/members)
[![Issues](https://img.shields.io/github/issues/reiidoda/InvesteRei?style=flat&color=black)](https://github.com/reiidoda/InvesteRei/issues)

InvesteRei is an AI-powered investing and wealth management platform that combines algorithmic portfolio automation, risk controls, and human approval before execution.

## Search-focused summary
InvesteRei is an open-source **AI investing platform** for **automated investing**, **algorithmic trading**, **portfolio management**, **wealth planning**, and **enterprise brokerage integrations** across web and mobile.

## Table of contents
- [How it works (simple)](#how-it-works-simple)
- [Why it feels better than traditional investing apps](#why-it-feels-better-than-traditional-investing-apps)
- [Architecture (Enterprise)](#architecture-enterprise)
- [Web app (Angular 17)](#web-app-angular-17)
- [Mobile app (Flutter)](#mobile-app-flutter)
- [Open source project docs](#open-source-project-docs)
- [Current state (implemented)](#current-state-implemented)
- [Quick start (Makefile)](#quick-start-makefile)

## How it works (simple)
1. Connect your broker and choose your risk level (conservative to aggressive).
2. InvesteRei continuously analyzes markets, your portfolio, and risk limits to create a **Trade Proposal**.
3. You get a clear summary: what will be bought/sold, why, expected impact, and worst-case risk. Then you tap **Approve** or **Decline**.

That's it. The strategy runs automatically, but you stay in control.

## Why it feels better than traditional investing apps
- **Human-in-the-loop safety:** nothing executes without your approval.
- **Explainable AI:** every proposal includes plain-language reasons, not black-box guesses.
- **Risk-first automation:** built-in controls (max drawdown targets, position limits, volatility controls, stop rules).
- **Always aligned to you:** goals + time horizon + constraints shape every decision.
- **Institutional-grade discipline:** rebalancing, diversification, and continuous monitoring.
- **Total transparency:** costs, performance, and trade history are easy to understand.

## What you see in every proposal
- Proposed trades (buy/sell) and portfolio change
- "Why now?" explanation (signals + risk + portfolio drift)
- Estimated risk impact (volatility, VaR/CVaR style risk, downside risk)
- Scenario preview (best/base/worst case)
- Safety checks passed (limits, liquidity, concentration, rules)

## Built for real-world execution
InvesteRei is designed to connect to real brokers, track live positions, and reconcile account data so the app always matches what actually happened in your brokerage.

InvesteRei: automated investing that behaves like a professional system — but is as easy as pressing Approve.

## Architecture (Enterprise)
- **Gateway**: Spring Cloud Gateway (routing, JWT validation, Redis rate limiting)
- **Auth Service**: User registration/login, JWT issuance
- **Portfolio Service**: Optimization + risk metrics, trade proposals/intents, auto-invest orchestration, audit logs
- **Simulation Service**: Backtesting jobs + results (async + persisted, versioned configs)
- **AI Service**: Return + risk forecasting, baseline evaluation, RL baseline policy, model registry
- **Market Data**: Ingestion + query APIs (stored in Postgres via portfolio-service, cached quotes via Redis, CSV + HTTP providers + scheduled backfills)
- **Reference Data**: Global instrument master, exchanges, currencies, FX rates
- **Broker Integrations**: Connections, routing, positions, orders, multi-asset order legs
- **Notifications**: In-app notifications with read state
- **Postgres**: Primary persistence
- **Redis**: Quote cache + simulation job queue

Broker parity matrix: `docs/broker-parity.md`.
JPM-style parity spec: `docs/jpm-platform-parity.md`.
Enterprise baseline: `docs/enterprise-features.md`.
Engineering and open-source docs index: `docs/README.md`.

## Web app (Angular 17)
- Login + token handling
- Portfolio Lab: optimizer inputs, constraints, and output weights
- Portfolio Builder: diversification diagnostics (sector/asset exposure)
- Risk Lab: advanced risk metrics (Sharpe, max drawdown, VaR, CVaR)
- Market Data: ingest prices, cached latest quotes, provider history, CSV/HTTP backfills, stored returns
- Auto-Invest: create plans, view run history, review notifications
- Banking: instant internal transfers between cash + investing
- Notification settings: preferences, destinations, delivery history
- Watchlists: multi-asset lists with AI risk insights
- Alerts: rule-based alerts with status + trigger workflow
- Statements: ledger entries, statement summaries, tax lots, corporate actions, reconciliation
- Research: curated notes with AI summaries and scores
- Proprietary Research: analyst ratings, price targets, focus list (mock)
- Screeners: filter by fundamentals + research signals
- Wealth Plan: goal-based planning with probability of success
- Rewards: new-money bonus offers (mock)
- Simulation Lab: submit backtests and inspect job status + curves
- AI Forecast: return/risk forecasts, walk-forward evaluation, model registry
- Manual Trading Desk: broker accounts, order review (AI + compliance), order placement

## Mobile app (Flutter)
- Login + API base selection
- Home hub with enterprise module navigation
- Portfolio Lab + Portfolio Builder diversification diagnostics
- Market Data: cached quotes + provider history + CSV/HTTP backfills
- Auto-Invest: plan creation, run history, notifications
- Banking: account state + instant internal transfers
- Wealth Plan: plan creation + Monte Carlo simulation
- Screeners: valuation/fundamental/research filters
- Notification preferences + delivery history
- Watchlists + AI insights
- Alerts + trigger workflow
- Rewards offers + enrollment/evaluation
- Best execution record viewer
- Surveillance alert viewer
- Org admin summary + audit feed
- Statements + tax lots + corporate actions + reconciliation
- Research notes + AI refresh
- Simulation: submit backtests, poll job status
- AI: return/risk forecasts, evaluation, model registry
- Manual trading: broker accounts, AI order review, order placement
- Audit log viewer (approvals and execution events)
- See `mobile/README.md` for run steps

## Open source project docs
- License: `LICENSE` (Apache-2.0)
- Citation metadata: `CITATION.cff`
- Code of Conduct: `CODE_OF_CONDUCT.md`
- Contributing: `CONTRIBUTING.md`
- Security Policy: `SECURITY.md`
- Governance: `GOVERNANCE.md`
- Support: `SUPPORT.md`
- Roadmap + milestones/issues map: `docs/ROADMAP.md`
- SEO/search growth playbook: `docs/SEO_GROWTH_PLAYBOOK.md`

## Current state (implemented)
- One-command local stack with Docker Compose + Makefile
- Persistent domain tables: accounts, positions, proposals, orders, intents, fills, audit events
- Auto-invest scheduler with idempotent runs and notifications
- Market data ingestion endpoints + Redis quote cache + CSV/HTTP providers + scheduled backfills + historical queries
- Market data licensing + entitlement enforcement toggle + license catalog support (GLOBAL / SYMBOL / EXCHANGE / ASSET_CLASS / REGION)
- Reference data + exchange calendars + broker integration scaffolding (connections, positions, orders, previews, cancel/refresh)
- Manual broker order review with AI/compliance guidance + cash/position impact
- Funding rails: sources, deposits, withdrawals, and broker transfers with HTTP adapters + simulated fallback
- Banking module with instant internal transfers between cash + investing
- Watchlists + alerts with AI enrichment hooks
- Statements, ledger ingestion, tax lots, corporate actions, reconciliation, statement feed import, research notes + AI summaries
- Proprietary research coverage (ratings/targets/focus list) + fundamentals screeners
- Portfolio Builder diversification diagnostics + Wealth Plan simulations
- Rewards/bonuses scaffolding for new-money incentives
- Notification preferences, destinations, and delivery audit trail with retry/backoff queue + bounce handling (SMTP + webhook + HTTP SMS/push providers)
- Simulation queue via Redis streams, versioned strategy configs, equity/drawdown curves
- Simulation worker scaling with concurrency caps, retries, capacity reporting, and per-user quotas
- AI risk-first endpoints, walk-forward evaluation, and model registry
- Security scaffolding: roles in JWT, TOTP MFA with challenge tokens, audit exports, request tracing headers, MFA/RBAC enforcement toggles
- Auto-invest advisory fee and minimum balance enforcement (JPM-style defaults)

## Quick start (Makefile)
1. Install Docker + Docker Compose.
2. From repo root:

```bash
make up
```

Common commands:

```bash
make logs
make down
make test
```

If you prefer not to use Make, run `docker compose up --build`.

- Web: http://localhost:4200
- Gateway: http://localhost:8080
- Auth: http://localhost:8081 (internal)
- Portfolio: http://localhost:8082 (internal)
- Simulation: http://localhost:8083 (internal)
- AI: http://localhost:8090 (internal, proxied via Gateway at `/api/v1/ai/**`)

---

## Smoke test checklist
Set a base URL once:

```bash
export API_BASE="http://localhost:8080"
```

1. Register

```bash
curl -s -X POST "$API_BASE/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"changeme123","organizationName":"Dev Holdings"}'
```

2. Login (capture token)

```bash
curl -s -X POST "$API_BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"changeme123","orgSlug":"dev-holdings"}'
```

Set `TOKEN` to the `token` in the response. If the response includes `mfaRequired: true`, call:

```bash
curl -s -X POST "$API_BASE/api/v1/auth/mfa/verify" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456","mfaToken":"<mfaToken>"}'
```

3. Call `/api/v1/trade/account`

```bash
curl -s "$API_BASE/api/v1/trade/account" \
  -H "Authorization: Bearer $TOKEN"
```

4. Link a broker account (required for execution intent)

```bash
curl -s -X POST "$API_BASE/api/v1/execution/accounts/link" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"providerId":"interactive_brokers","region":"US","assetClasses":["EQUITY"]}'
```

5. Create proposal

```bash
curl -s -X POST "$API_BASE/api/v1/trade/proposals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbols":["AAPL","MSFT"],"mu":[0.08,0.06],"cov":[[0.10,0.02],[0.02,0.08]],"prices":{"AAPL":180,"MSFT":320},"riskAversion":6,"maxWeight":0.6,"minWeight":0.0}'
```

6. Approve

```bash
curl -s -X POST "$API_BASE/api/v1/trade/proposals/{proposalId}/decision" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"APPROVE"}'
```

7. Create intent

```bash
curl -s -X POST "$API_BASE/api/v1/execution/intents/{proposalId}" \
  -H "Authorization: Bearer $TOKEN"
```

8. Submit to broker (requires live adapter config)

```bash
curl -s -X POST "$API_BASE/api/v1/execution/intents/{intentId}/submit" \
  -H "Authorization: Bearer $TOKEN"
```

9. Simulate fill

```bash
curl -s -X POST "$API_BASE/api/v1/execution/intents/{intentId}/simulate-fill" \
  -H "Authorization: Bearer $TOKEN"
```

---

## JPM parity quick checks

Banking account + transfer:

```bash
curl -s "$API_BASE/api/v1/banking/account" -H "Authorization: Bearer $TOKEN"

curl -s -X POST "$API_BASE/api/v1/banking/transfer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"direction":"TO_INVESTING","amount":100,"note":"instant transfer"}'
```

Proprietary research + screeners:

```bash
curl -s "$API_BASE/api/v1/research/coverage" -H "Authorization: Bearer $TOKEN"

curl -s -X POST "$API_BASE/api/v1/screeners/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assetClass":"EQUITY","rating":"OVERWEIGHT","limit":10}'
```

Wealth plan + rewards:

```bash
curl -s -X POST "$API_BASE/api/v1/wealth/plan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planType":"RETIREMENT","name":"Retirement Plan","startingBalance":25000,"targetBalance":500000,"monthlyContribution":800,"horizonYears":20}'

curl -s "$API_BASE/api/v1/rewards/offers" -H "Authorization: Bearer $TOKEN"
```

---

## CSV market data backfill
Drop CSV files into `data/market/` (mounted into the portfolio container at `/data/market`) and trigger a backfill to load them into Postgres.

File format (one file per symbol, e.g. `AAPL.csv`):

```
timestamp,open,high,low,close,volume
2024-01-02,183.10,185.50,182.40,184.90,102340000
```

Trigger a backfill:

```bash
curl -s -X POST "$API_BASE/api/v1/market-data/backfill" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbols":["AAPL","MSFT"],"start":"2024-01-01","end":"2024-12-31","granularity":"DAY","limit":0,"source":"csv"}'
```

Enable scheduled backfills:

```bash
export MARKETDATA_BACKFILL_ENABLED=true
export MARKETDATA_BACKFILL_SYMBOLS=AAPL,MSFT
export MARKETDATA_BACKFILL_DELAY_MS=3600000
```

---

## HTTP market data provider (commercial feed scaffold)
Enable the HTTP provider and point it to a market data gateway or vendor adapter. The provider expects JSON responses with `quotes` or `prices` arrays by default, and supports JSON pointer mapping for non-standard payloads. API keys live in env vars only.

Example config:

```bash
export MARKETDATA_HTTP_ENABLED=true
export MARKETDATA_HTTP_BASE_URL=https://market-data.example.com/api
export MARKETDATA_HTTP_LATEST_QUOTES_PATH=/quotes/latest
export MARKETDATA_HTTP_HISTORY_PATH=/history
export MARKETDATA_HTTP_API_KEY_HEADER=X-API-KEY
export MARKETDATA_HTTP_API_KEY=your_key_here
export MARKETDATA_HTTP_MAPPING_LATEST_QUOTES_POINTER=/quotes
export MARKETDATA_HTTP_MAPPING_HISTORY_PRICES_POINTER=/prices
```

Backfill using the HTTP source:

```bash
curl -s -X POST "$API_BASE/api/v1/market-data/backfill" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbols":["AAPL","MSFT"],"start":"2024-01-01","end":"2024-12-31","granularity":"DAY","limit":0,"source":"http"}'
```

---

## Market data licensing + entitlements
Enable entitlement enforcement:

```bash
export MARKETDATA_ENTITLEMENTS_ENABLED=true
```

Register a market data license:

```bash
curl -s -X POST "$API_BASE/api/v1/market-data/licenses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider":"starter_csv","plan":"internal","status":"ACTIVE","assetClasses":["EQUITY"],"regions":["US"]}'
```

Grant entitlements (GLOBAL/SYMBOL/EXCHANGE/ASSET_CLASS/REGION):

```bash
curl -s -X POST "$API_BASE/api/v1/market-data/entitlements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entitlementType":"SYMBOL","entitlementValue":"AAPL","status":"ACTIVE","source":"starter_csv"}'
```

Fetch a license catalog (HTTP provider):

```bash
curl -s "$API_BASE/api/v1/market-data/licenses/catalog" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
export MARKETDATA_LICENSE_CATALOG_HTTP_ENABLED=true
export MARKETDATA_LICENSE_CATALOG_BASE_URL=https://licenses.example.com/api
```

---

## Notification preferences + destinations
Create a destination and enable a delivery channel:

```bash
curl -s -X POST "$API_BASE/api/v1/notifications/destinations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"EMAIL","destination":"alerts@example.com","label":"Primary"}'
```

```bash
curl -s -X POST "$API_BASE/api/v1/notifications/destinations/{id}/verify" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -s -X POST "$API_BASE/api/v1/notifications/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"EMAIL","enabled":true,"types":["AUTO_INVEST_PROPOSAL","ALERT_TRIGGERED"],"quietStartHour":22,"quietEndHour":7,"timezone":"UTC"}'
```

---

## Notification providers (SMTP + Webhook + SMS/Push HTTP)
Enable SMTP delivery:

```bash
export NOTIFICATION_EMAIL_PROVIDER=smtp-email
export NOTIFICATION_SMTP_ENABLED=true
export NOTIFICATION_SMTP_HOST=smtp.example.com
export NOTIFICATION_SMTP_PORT=587
export NOTIFICATION_SMTP_USERNAME=your_user
export NOTIFICATION_SMTP_PASSWORD=your_password
export NOTIFICATION_SMTP_FROM_ADDRESS=noreply@investerei.com
export NOTIFICATION_SMTP_FROM_NAME="InvesteRei"
```

Enable webhook delivery:

```bash
export NOTIFICATION_WEBHOOK_PROVIDER=http-webhook
export NOTIFICATION_WEBHOOK_HTTP_ENABLED=true
export NOTIFICATION_WEBHOOK_SIGNATURE_SECRET=optional_shared_secret
```

Webhook payload is JSON with `id`, `type`, `title`, `body`, `entityType`, `entityId`, `metadata`, `userId`, and `createdAt`.

Enable SMS delivery (HTTP):

```bash
export NOTIFICATION_SMS_PROVIDER=http-sms
export NOTIFICATION_SMS_HTTP_ENABLED=true
export NOTIFICATION_SMS_BASE_URL=https://sms.example.com/api
export NOTIFICATION_SMS_API_KEY=your_key_here
```

Enable push delivery (HTTP):

```bash
export NOTIFICATION_PUSH_PROVIDER=http-push
export NOTIFICATION_PUSH_HTTP_ENABLED=true
export NOTIFICATION_PUSH_BASE_URL=https://push.example.com/api
export NOTIFICATION_PUSH_API_KEY=your_key_here
```

---

## Security scaffolds (MFA + RBAC)
- JWT now includes `roles` and `mfa` claims; gateway forwards `X-User-Roles` and `X-User-Mfa`.
- Gateway injects `X-Request-Id` and `X-Trace-Id` for log correlation.
- MFA uses TOTP with encrypted secrets; login returns a short-lived `mfaToken` when verification is required.
- Complete MFA by calling `POST /api/v1/auth/mfa/verify` with `{ "code": "123456", "mfaToken": "..." }` to get an access token.
- Set `AUTH_MFA_SECRET_KEY` (32+ bytes recommended) in production.
- Audit export (`/api/v1/audit/events/export`) requires `ADMIN` or `AUDITOR` role.
- Optional enforcement flags:
  - `SECURITY_MFA_ENFORCE=true` to require MFA on funding, broker orders, execution intents, and trade approvals.
  - `SECURITY_RBAC_ENFORCE=true` to require `ADMIN`/`DATA_ADMIN` on market-data and reference-data writes.
- Admin role management: `POST /api/v1/auth/users/{id}/roles` (requires `ADMIN` token).
- Bootstrap admins: set `AUTH_BOOTSTRAP_ADMINS=admin@example.com` to grant `ADMIN` on registration/login.

---

## Gateway rate limiting (Redis)
Rate limiting is enabled at the gateway using Redis. Defaults are safe for local development and can be tuned via env vars:

```bash
export REDIS_HOST=localhost
export REDIS_PORT=6379
export GATEWAY_RATELIMIT_REPLENISH=30
export GATEWAY_RATELIMIT_BURST=60
export GATEWAY_RATELIMIT_TOKENS=1
```

---

## Broker statement CSV import
Paste or upload a broker CSV into ledger entries and optionally reconcile positions/tax lots:

```bash
curl -s -X POST "$API_BASE/api/v1/statements/import" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"acct-001","source":"broker_csv","csv":"date,action,symbol,quantity,price,amount,currency\n2024-01-05,BUY,AAPL,10,185.80,1858.00,USD","delimiter":",","hasHeader":true,"defaultCurrency":"USD","applyPositions":true,"rebuildTaxLots":true,"lotMethod":"FIFO"}'
```

## Broker statement feed (HTTP)
Use a statement feed provider to ingest ledger entries from a custodian API and optionally reconcile positions/tax lots:

```bash
curl -s -X POST "$API_BASE/api/v1/statements/import-feed" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"providerId":"custodian_http","accountId":"acct-001","start":"2024-01-01T00:00:00Z","end":"2024-12-31T23:59:59Z","applyPositions":true,"rebuildTaxLots":true,"lotMethod":"FIFO"}'
```

## API overview (via Gateway)

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/profile`
- `POST /api/v1/auth/mfa/enroll`
- `POST /api/v1/auth/mfa/verify`
- `POST /api/v1/auth/mfa/disable`
- `POST /api/v1/auth/users/{id}/roles`
- `GET /api/v1/auth/orgs`
- `POST /api/v1/auth/orgs`
- `GET /api/v1/auth/orgs/{orgId}`
- `GET /api/v1/auth/orgs/{orgId}/members`
- `POST /api/v1/auth/orgs/{orgId}/members/{userId}/role`
- `POST /api/v1/auth/orgs/{orgId}/invites`
- `POST /api/v1/auth/orgs/invites/{token}/accept`
- `GET /api/v1/auth/orgs/{orgId}/sso`
- `POST /api/v1/auth/orgs/{orgId}/sso`
- `DELETE /api/v1/auth/orgs/{orgId}/sso/{providerId}`
- `GET /api/v1/auth/orgs/{orgId}/scim`
- `POST /api/v1/auth/orgs/{orgId}/scim`
- `POST /api/v1/auth/orgs/{orgId}/scim/rotate`

Auth tokens now include org context (`org_id`, `org_roles`). Use `orgId` or `orgSlug` in `/auth/login` to select the tenant; the gateway forwards `X-Org-Id`/`X-Org-Roles` headers downstream.

### Portfolio + Risk
- `POST /api/v1/portfolio/optimize`
- `POST /api/v1/risk/metrics/advanced`

### Trade + Execution (paper)
- `GET /api/v1/trade/account`
- `POST /api/v1/trade/account/seed`
- `POST /api/v1/trade/proposals`
- `GET /api/v1/trade/proposals/{id}`
- `POST /api/v1/trade/proposals/{id}/decision`
- `GET /api/v1/execution/providers`
- `GET /api/v1/execution/accounts`
- `POST /api/v1/execution/accounts/link`
- `GET /api/v1/execution/intents`
- `GET /api/v1/execution/intents/{id}`
- `POST /api/v1/execution/intents/{proposalId}`
- `POST /api/v1/execution/intents/{intentId}/submit`
- `POST /api/v1/execution/intents/{intentId}/simulate-fill`

### Funding + Compliance
- `GET /api/v1/funding/providers`
- `GET /api/v1/funding/sources`
- `POST /api/v1/funding/sources`
- `POST /api/v1/funding/sources/{id}/verify`
- `POST /api/v1/funding/deposits`
- `GET /api/v1/funding/deposits`
- `POST /api/v1/funding/withdrawals`
- `GET /api/v1/funding/withdrawals`
- `POST /api/v1/funding/transfers`
- `GET /api/v1/funding/transfers`
- `GET /api/v1/compliance/profile`
- `POST /api/v1/compliance/profile`
- `GET /api/v1/compliance/report`

### Market data
- `POST /api/v1/market-data/prices`
- `GET /api/v1/market-data/prices`
- `GET /api/v1/market-data/symbols`
- `GET /api/v1/market-data/providers`
- `GET /api/v1/market-data/licenses`
- `GET /api/v1/market-data/licenses/catalog`
- `POST /api/v1/market-data/licenses`
- `GET /api/v1/market-data/entitlements`
- `POST /api/v1/market-data/entitlements`
- `GET /api/v1/market-data/quotes/latest`
- `GET /api/v1/market-data/history`
- `GET /api/v1/market-data/returns`
- `POST /api/v1/market-data/backfill`

### Reference data
- `POST /api/v1/reference/instruments`
- `GET /api/v1/reference/instruments`
- `GET /api/v1/reference/instruments/{id}`
- `POST /api/v1/reference/exchanges`
- `GET /api/v1/reference/exchanges`
- `POST /api/v1/reference/exchanges/{code}/calendar`
- `GET /api/v1/reference/exchanges/{code}/calendar`
- `GET /api/v1/reference/exchanges/{code}/calendar/next-open`
- `POST /api/v1/reference/exchanges/{code}/calendar/sync`
- `GET /api/v1/reference/calendar/providers`
- `POST /api/v1/reference/currencies`
- `GET /api/v1/reference/currencies`
- `POST /api/v1/reference/fx-rates`
- `GET /api/v1/reference/fx-rates`

### Brokers
- `GET /api/v1/brokers`
- `POST /api/v1/brokers/{brokerId}/connections`
- `GET /api/v1/brokers/connections`
- `POST /api/v1/brokers/connections/{id}/sync`
- `GET /api/v1/brokers/accounts`
- `GET /api/v1/brokers/accounts/{id}/positions`
- `GET /api/v1/brokers/accounts/{id}/orders`
- `POST /api/v1/brokers/accounts/{id}/orders`
- `POST /api/v1/brokers/accounts/{id}/orders/preview`
- `POST /api/v1/brokers/accounts/{id}/orders/review`
- `POST /api/v1/brokers/accounts/{id}/orders/{orderId}/refresh`
- `POST /api/v1/brokers/accounts/{id}/orders/{orderId}/cancel`
- `POST /api/v1/brokers/recommend`

### Watchlists + Alerts
- `POST /api/v1/watchlists`
- `GET /api/v1/watchlists`
- `POST /api/v1/watchlists/{id}`
- `DELETE /api/v1/watchlists/{id}`
- `GET /api/v1/watchlists/{id}/items`
- `POST /api/v1/watchlists/{id}/items`
- `DELETE /api/v1/watchlists/{id}/items/{itemId}`
- `POST /api/v1/watchlists/{id}/insights`
- `POST /api/v1/alerts`
- `GET /api/v1/alerts`
- `POST /api/v1/alerts/{id}/status`
- `POST /api/v1/alerts/{id}/trigger`

### Statements + Research
- `POST /api/v1/statements/ledger`
- `GET /api/v1/statements/ledger`
- `POST /api/v1/statements/tax-lots`
- `GET /api/v1/statements/tax-lots`
- `POST /api/v1/statements/corporate-actions`
- `GET /api/v1/statements/corporate-actions`
- `POST /api/v1/statements`
- `GET /api/v1/statements`
- `GET /api/v1/statements/summary`
- `POST /api/v1/statements/reconcile`
- `POST /api/v1/statements/import`
- `GET /api/v1/statements/providers`
- `POST /api/v1/statements/import-feed`
- `POST /api/v1/research/notes`
- `GET /api/v1/research/notes`
- `POST /api/v1/research/notes/{id}/ai`
- `POST /api/v1/research/notes/ai`

### Simulation
- `POST /api/v1/simulation/backtest`
- `GET /api/v1/simulation/backtest/{id}`
- `GET /api/v1/simulation/capacity`
- `GET /api/v1/simulation/quota`

### AI
- `POST /api/v1/ai/predict`
- `POST /api/v1/ai/risk`
- `POST /api/v1/ai/evaluate`
- `POST /api/v1/ai/rl/baseline`
- `POST /api/v1/ai/models`
- `GET /api/v1/ai/models`
- `GET /api/v1/ai/models/{id}`
- `POST /api/v1/ai/models/{id}/status`

### Auto-invest + Notifications + Audit
- `POST /api/v1/auto-invest/plans`
- `GET /api/v1/auto-invest/plans`
- `POST /api/v1/auto-invest/plans/{id}/status`
- `POST /api/v1/auto-invest/plans/{id}/run`
- `GET /api/v1/auto-invest/plans/{id}/runs`
- `GET /api/v1/auto-invest/model-portfolios`
- `GET /api/v1/auto-invest/plans/{id}/fees`
- `POST /api/v1/auto-invest/plans/{id}/fees/charge`
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/{id}/read`
- `GET /api/v1/notifications/preferences`
- `POST /api/v1/notifications/preferences`
- `GET /api/v1/notifications/destinations`
- `POST /api/v1/notifications/destinations`
- `POST /api/v1/notifications/destinations/{id}/verify`
- `POST /api/v1/notifications/destinations/{id}/disable`
- `GET /api/v1/notifications/deliveries`
- `GET /api/v1/audit/events`
- `GET /api/v1/audit/events/export`

### Banking + Rewards + Wealth
- `GET /api/v1/banking/account`
- `POST /api/v1/banking/transfer`
- `GET /api/v1/banking/transfers`
- `GET /api/v1/research/coverage`
- `GET /api/v1/research/focus-list`
- `POST /api/v1/screeners/query`
- `POST /api/v1/portfolio/builder/analyze`
- `POST /api/v1/wealth/plan`
- `GET /api/v1/wealth/plan`
- `GET /api/v1/wealth/plan/{id}`
- `POST /api/v1/wealth/plan/{id}/simulate`
- `GET /api/v1/rewards/offers`
- `GET /api/v1/rewards/enrollments`
- `POST /api/v1/rewards/enroll`
- `POST /api/v1/rewards/evaluate`

### Surveillance + Best Execution
- `GET /api/v1/surveillance/alerts`
- `GET /api/v1/best-execution`

## Production enablement notes
- Provide vendor credentials and payload mappings for HTTP adapters (market data, brokers, funding, statements, exchange calendars).
- Wire SMS/push providers and webhook signatures via the HTTP notification settings.
- Use `/api/v1/simulation/capacity` or `/actuator/metrics` gauges to drive autoscaling in your scheduler.
- Rotate production secrets (`JWT_SECRET`, `AUTH_MFA_SECRET_KEY`) and enable MFA/RBAC enforcement flags.

## Math Engine Coverage
This repo includes a broad, extensible math engine: mean-variance optimization, risk parity, Kelly (approx), Black-Litterman (posterior), covariance estimators (sample/EWMA/shrinkage), and advanced risk metrics (Sharpe/Sortino/Drawdown/VaR/CVaR/Cornish-Fisher, etc.).

> Note: mathematics for investing is effectively unbounded. The project is structured so new models/formulas can be added as modules without breaking the API.

## Living Library (Everything Ever Published)
A static repository can never contain all formulas ever published. InvesteRei includes a Living Math Library (`math-library/`) with a registry + plugin interfaces so the system can continuously expand.

## Continuous Ingestion
A scheduled GitHub Action ingests new arXiv paper metadata into `math-library/papers/inbox/` and opens a PR daily. See `math-library/ingestion/README.md`.
