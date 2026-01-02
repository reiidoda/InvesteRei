package com.alphamath.portfolio.trade;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AiRecommendation {
  private double confidence;
  private String summary;
  private List<String> reasons = new ArrayList<>();
}
