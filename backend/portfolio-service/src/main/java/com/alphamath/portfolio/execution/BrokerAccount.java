package com.alphamath.portfolio.execution;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
public class BrokerAccount {
  private String id;
  @JsonIgnore
  private String userId;
  private String providerId;
  private String providerName;
  private Region region;
  private List<AssetClass> assetClasses = new ArrayList<>();
  private BrokerAccountStatus status;
  private Instant createdAt;
}
