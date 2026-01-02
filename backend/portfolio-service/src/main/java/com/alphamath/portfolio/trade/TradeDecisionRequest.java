package com.alphamath.portfolio.trade;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TradeDecisionRequest {
  @NotNull
  private DecisionAction action;
}
