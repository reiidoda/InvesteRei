package com.alphamath.portfolio.trade;

import com.alphamath.portfolio.execution.AssetClass;
import com.alphamath.portfolio.execution.OrderType;
import com.alphamath.portfolio.execution.Region;
import com.alphamath.portfolio.execution.TimeInForce;
import com.alphamath.portfolio.math.Optimizers;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
public class TradeProposalRequest {
  @NotNull @Size(min = 2, max = 50)
  private List<@NotNull String> symbols;

  @NotNull @Size(min = 2, max = 50)
  private List<@NotNull Double> mu;

  @NotNull @Size(min = 2, max = 50)
  private List<List<@NotNull Double>> cov;

  @NotNull
  private Map<String, Double> prices = new LinkedHashMap<>();

  /** Optimizer method */
  private Optimizers.Method method = Optimizers.Method.MEAN_VARIANCE_PGD;

  /** For Kelly */
  private Double fractionalKelly = 0.25;

  /** For Black-Litterman */
  private Double tau = 0.05;
  private List<List<Double>> P = new ArrayList<>();
  private List<Double> q = new ArrayList<>();
  private List<Double> omegaDiag = new ArrayList<>();

  @NotNull @Min(1) @Max(100)
  private Integer riskAversion = 6;

  @NotNull
  private Double maxWeight = 0.6;

  @NotNull
  private Double minWeight = 0.0;

  private Double minTradeValue = 10.0;
  private Double maxTradePctOfEquity = 0.25;
  private Double maxTurnover = 0.7;

  /** Execution settings */
  private ExecutionMode executionMode = ExecutionMode.PAPER;
  private Region region = Region.US;
  private AssetClass assetClass = AssetClass.EQUITY;
  private String providerPreference;
  private OrderType orderType = OrderType.MARKET;
  private TimeInForce timeInForce = TimeInForce.DAY;
}
