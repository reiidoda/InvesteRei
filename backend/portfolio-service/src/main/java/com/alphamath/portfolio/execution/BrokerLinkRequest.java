package com.alphamath.portfolio.execution;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class BrokerLinkRequest {
  @NotBlank
  private String providerId;

  @NotNull
  private Region region = Region.US;

  private List<AssetClass> assetClasses = new ArrayList<>();
}
