package com.alphamath.portfolio.funding;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.Instant;

@Data
public class FundingDepositReceipt {
  private String id;
  private String sourceId;
  private double amount;
  private String status;
  private String note;
  private Instant createdAt;
  @JsonIgnore
  private String userId;
}
