# InvesteRei AI

This folder is an enterprise-ready **starting point** for:
- Supervised prediction (returns/volatility)
- Risk estimation (tail risk)
- Reinforcement learning baseline (policy learning via `/v1/rl/baseline`)

**Design rule:** AI produces signals + uncertainty. The deterministic math engine enforces constraints.

Baseline policy input expects a 2D returns array (assets x samples) and returns target weights plus deltas.

Example:

```bash
curl -s http://localhost:8090/v1/rl/baseline \
  -H "Content-Type: application/json" \
  -d '{"returns":[[0.01,-0.02,0.005],[0.008,-0.01,0.004]],"current_weights":[0.6,0.4]}'
```
