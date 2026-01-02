from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List
import numpy as np

app = FastAPI(title="InvesteRei AI Service", version="0.1.0")

class PredictRequest(BaseModel):
    returns: List[float] = Field(min_length=30, max_length=50000)
    horizon: int = Field(default=1, ge=1, le=30)

class PredictResponse(BaseModel):
    expected_return: float
    volatility: float
    p_up: float
    confidence: float
    disclaimer: str

@app.post("/v1/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    r = np.array(req.returns, dtype=float)
    mu = float(np.mean(r))
    vol = float(np.std(r, ddof=1))
    if vol <= 1e-12:
        p_up = 0.5 if mu == 0 else (1.0 if mu > 0 else 0.0)
        conf = 0.2
    else:
        z = mu / vol
        p_up = float(0.5 * (1.0 + np.math.erf(z / np.sqrt(2.0))))
        conf = float(min(0.9, 0.55 + abs(z) * 0.1))

    return PredictResponse(
        expected_return=mu * req.horizon,
        volatility=vol * np.sqrt(req.horizon),
        p_up=p_up,
        confidence=conf,
        disclaimer="Educational forecast only. Not financial advice."
    )
