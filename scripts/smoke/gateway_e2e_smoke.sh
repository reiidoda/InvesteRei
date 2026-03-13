#!/usr/bin/env bash

set -euo pipefail

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8080}"
SMOKE_EMAIL="${SMOKE_EMAIL:-smoke.$(date +%s).$RANDOM@investerei.local}"
SMOKE_PASSWORD="${SMOKE_PASSWORD:-SmokePass123!}"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-300}"
START_STACK=0
CLEANUP=0
COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"
WORKDIR="$(mktemp -d)"

log() {
  printf '[gateway-smoke] %s\n' "$*"
}

fail() {
  printf '[gateway-smoke][FAIL] %s\n' "$*" >&2
  exit 1
}

cleanup() {
  rm -rf "${WORKDIR}"
  if [[ "${START_STACK}" -eq 1 && "${CLEANUP}" -eq 1 ]]; then
    log "Stopping docker compose stack"
    compose down -v --remove-orphans || true
  fi
}
trap cleanup EXIT

compose() {
  # shellcheck disable=SC2206
  local cmd=(${COMPOSE_CMD})
  "${cmd[@]}" "$@"
}

require_bin() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required binary: $1"
}

usage() {
  cat <<'EOF'
Usage: gateway_e2e_smoke.sh [options]

Options:
  --gateway-url URL        Gateway base URL (default: http://localhost:8080)
  --email EMAIL            Smoke user email (default: generated unique address)
  --password PASSWORD      Smoke user password (default: SmokePass123!)
  --start-stack            Start docker compose stack before running smoke flow
  --cleanup                If --start-stack is used, tear down compose stack on exit
  --wait-timeout SECONDS   Max wait for gateway health (default: 300)
  --compose-cmd CMD        Compose command (default: "docker compose")
  --help                   Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --gateway-url)
      [[ $# -ge 2 ]] || fail "--gateway-url requires a value"
      GATEWAY_URL="$2"
      shift 2
      ;;
    --email)
      [[ $# -ge 2 ]] || fail "--email requires a value"
      SMOKE_EMAIL="$2"
      shift 2
      ;;
    --password)
      [[ $# -ge 2 ]] || fail "--password requires a value"
      SMOKE_PASSWORD="$2"
      shift 2
      ;;
    --start-stack)
      START_STACK=1
      shift
      ;;
    --cleanup)
      CLEANUP=1
      shift
      ;;
    --wait-timeout)
      [[ $# -ge 2 ]] || fail "--wait-timeout requires a value"
      WAIT_TIMEOUT_SECONDS="$2"
      shift 2
      ;;
    --compose-cmd)
      [[ $# -ge 2 ]] || fail "--compose-cmd requires a value"
      COMPOSE_CMD="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

require_bin curl
require_bin jq

api_call() {
  local step="$1"
  local method="$2"
  local path="$3"
  local expected_status="$4"
  local token="${5:-}"
  local payload_file="${6:-}"
  local url="${GATEWAY_URL%/}${path}"
  local response_file
  response_file="$(mktemp "${WORKDIR}/response.${step// /_}.XXXXXX.json")"

  local -a args
  args=(-sS -X "${method}" "${url}" -H "Accept: application/json")
  if [[ -n "${token}" ]]; then
    args+=(-H "Authorization: Bearer ${token}")
  fi
  if [[ -n "${payload_file}" ]]; then
    args+=(-H "Content-Type: application/json" --data-binary "@${payload_file}")
  fi

  local status
  if ! status="$(curl "${args[@]}" -o "${response_file}" -w "%{http_code}")"; then
    printf '[gateway-smoke][FAIL] Step "%s" request failed: %s %s\n' "${step}" "${method}" "${url}" >&2
    if [[ -s "${response_file}" ]]; then
      printf '[gateway-smoke][FAIL] Response body:\n%s\n' "$(cat "${response_file}")" >&2
    fi
    exit 1
  fi

  if [[ "${status}" != "${expected_status}" ]]; then
    printf '[gateway-smoke][FAIL] Step "%s" failed: %s %s\n' "${step}" "${method}" "${url}" >&2
    printf '[gateway-smoke][FAIL] Expected status: %s, actual status: %s\n' "${expected_status}" "${status}" >&2
    if [[ -s "${response_file}" ]]; then
      printf '[gateway-smoke][FAIL] Response body:\n%s\n' "$(cat "${response_file}")" >&2
    fi
    exit 1
  fi

  printf '%s' "${response_file}"
}

json_get_required() {
  local file="$1"
  local jq_expr="$2"
  local value
  if ! value="$(jq -er "${jq_expr}" "${file}")"; then
    printf '[gateway-smoke][FAIL] Missing/invalid JSON field using jq expr: %s\n' "${jq_expr}" >&2
    printf '[gateway-smoke][FAIL] Response body:\n%s\n' "$(cat "${file}")" >&2
    exit 1
  fi
  printf '%s' "${value}"
}

wait_for_gateway() {
  local deadline=$((SECONDS + WAIT_TIMEOUT_SECONDS))
  local url="${GATEWAY_URL%/}/actuator/health"
  local health_file="${WORKDIR}/gateway_health.json"

  while (( SECONDS < deadline )); do
    local status
    if status="$(curl -sS -o "${health_file}" -w "%{http_code}" "${url}")"; then
      if [[ "${status}" == "200" ]] && jq -e '.status == "UP"' "${health_file}" >/dev/null 2>&1; then
        log "Gateway is healthy at ${url}"
        return 0
      fi
    fi
    sleep 3
  done

  printf '[gateway-smoke][FAIL] Gateway health check did not pass before timeout (%ss): %s\n' \
    "${WAIT_TIMEOUT_SECONDS}" "${url}" >&2
  if [[ -f "${health_file}" ]]; then
    printf '[gateway-smoke][FAIL] Last health response:\n%s\n' "$(cat "${health_file}")" >&2
  fi
  exit 1
}

if [[ "${START_STACK}" -eq 1 ]]; then
  log "Starting docker compose stack for smoke flow"
  compose up -d --build postgres redis ai auth portfolio simulation gateway
fi

wait_for_gateway

log "Step 1: Register smoke user via gateway auth route"
register_payload="${WORKDIR}/register.json"
cat > "${register_payload}" <<JSON
{
  "email": "${SMOKE_EMAIL}",
  "password": "${SMOKE_PASSWORD}",
  "organizationName": "Smoke Test Org"
}
JSON
register_resp="$(api_call "register" "POST" "/api/v1/auth/register" "200" "" "${register_payload}")"

log "Step 2: Login via gateway auth route"
login_payload="${WORKDIR}/login.json"
cat > "${login_payload}" <<JSON
{
  "email": "${SMOKE_EMAIL}",
  "password": "${SMOKE_PASSWORD}"
}
JSON
login_resp="$(api_call "login" "POST" "/api/v1/auth/login" "200" "" "${login_payload}")"
access_token="$(json_get_required "${login_resp}" '.token')"
org_id="$(json_get_required "${login_resp}" '.orgId')"

log "Step 3: Set compliance profile for live execution eligibility"
compliance_payload="${WORKDIR}/compliance.json"
cat > "${compliance_payload}" <<'JSON'
{
  "kycStatus": "VERIFIED",
  "amlStatus": "PASSED",
  "suitabilityStatus": "SUITABLE",
  "riskProfile": "MODERATE",
  "accountType": "INDIVIDUAL",
  "taxResidency": "US",
  "accreditedInvestor": false,
  "restrictions": []
}
JSON
api_call "compliance_profile" "POST" "/api/v1/compliance/profile" "200" "${access_token}" "${compliance_payload}" >/dev/null

log "Step 4: Link broker account needed by live proposal approval"
link_payload="${WORKDIR}/execution_link.json"
cat > "${link_payload}" <<'JSON'
{
  "providerId": "alpaca",
  "region": "US",
  "assetClasses": ["EQUITY"],
  "label": "gateway-smoke-link",
  "metadata": {
    "source": "gateway_e2e_smoke"
  }
}
JSON
api_call "execution_link" "POST" "/api/v1/execution/accounts/link" "200" "${access_token}" "${link_payload}" >/dev/null

log "Step 5: Create live trade proposal"
proposal_payload="${WORKDIR}/proposal.json"
cat > "${proposal_payload}" <<'JSON'
{
  "symbols": ["AAPL", "MSFT"],
  "mu": [0.10, 0.08],
  "cov": [[0.04, 0.01], [0.01, 0.03]],
  "prices": {
    "AAPL": 180.0,
    "MSFT": 350.0
  },
  "riskAversion": 6,
  "maxWeight": 0.7,
  "minWeight": 0.0,
  "executionMode": "LIVE",
  "region": "US",
  "assetClass": "EQUITY",
  "providerPreference": "alpaca",
  "orderType": "MARKET",
  "timeInForce": "DAY"
}
JSON
proposal_resp="$(api_call "proposal_create" "POST" "/api/v1/trade/proposals" "200" "${access_token}" "${proposal_payload}")"
proposal_id="$(json_get_required "${proposal_resp}" '.id')"

log "Step 6: Approve proposal and create execution intent"
decision_payload="${WORKDIR}/decision.json"
cat > "${decision_payload}" <<'JSON'
{
  "action": "APPROVE"
}
JSON
decision_resp="$(api_call "proposal_decide" "POST" "/api/v1/trade/proposals/${proposal_id}/decision" "200" "${access_token}" "${decision_payload}")"
execution_intent_id="$(json_get_required "${decision_resp}" '.executionIntentId')"

log "Step 7: Retrieve execution intent through gateway"
intent_resp="$(api_call "execution_intent_get" "GET" "/api/v1/execution/intents/${execution_intent_id}" "200" "${access_token}")"
intent_id_read="$(json_get_required "${intent_resp}" '.id')"
if [[ "${intent_id_read}" != "${execution_intent_id}" ]]; then
  fail "Execution intent mismatch: expected ${execution_intent_id}, got ${intent_id_read}"
fi

log "Step 8: Run core reporting endpoints"
statement_payload="${WORKDIR}/statement_generate.json"
cat > "${statement_payload}" <<'JSON'
{
  "accountId": "smoke-account",
  "startingBalance": 10000,
  "baseCurrency": "USD",
  "metadata": {
    "source": "gateway_e2e_smoke"
  }
}
JSON
api_call "statement_generate" "POST" "/api/v1/statements" "200" "${access_token}" "${statement_payload}" >/dev/null
api_call "statement_list" "GET" "/api/v1/statements?accountId=smoke-account" "200" "${access_token}" >/dev/null
api_call "statement_summary" "GET" "/api/v1/statements/summary?accountId=smoke-account" "200" "${access_token}" >/dev/null

log "Step 9: Run org admin reporting endpoints"
admin_summary_resp="$(api_call "admin_summary" "GET" "/api/v1/admin/org/summary" "200" "${access_token}")"
admin_org_id="$(json_get_required "${admin_summary_resp}" '.orgId')"
if [[ "${admin_org_id}" != "${org_id}" ]]; then
  fail "Admin summary orgId mismatch: expected ${org_id}, got ${admin_org_id}"
fi
api_call "admin_audit" "GET" "/api/v1/admin/org/audit/events?limit=10" "200" "${access_token}" >/dev/null

log "Smoke suite passed"
cat <<EOF
{
  "result": "PASS",
  "gatewayUrl": "${GATEWAY_URL}",
  "email": "${SMOKE_EMAIL}",
  "orgId": ${org_id},
  "proposalId": "${proposal_id}",
  "executionIntentId": "${execution_intent_id}"
}
EOF
