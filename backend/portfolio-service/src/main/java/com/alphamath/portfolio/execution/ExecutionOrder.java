package com.alphamath.portfolio.execution;

import com.alphamath.portfolio.trade.TradeSide;
import lombok.Data;

@Data
public class ExecutionOrder {
  private String symbol;
  private TradeSide side;
  private double quantity;
  private OrderType orderType;
  private TimeInForce timeInForce;
  private Double limitPrice;
}
