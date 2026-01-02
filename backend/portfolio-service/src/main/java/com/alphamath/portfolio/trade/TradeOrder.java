package com.alphamath.portfolio.trade;

import lombok.Data;

@Data
public class TradeOrder {
  private String symbol;
  private TradeSide side;
  private double quantity;
  private double price;
  private double notional;
  private double fee;
}
