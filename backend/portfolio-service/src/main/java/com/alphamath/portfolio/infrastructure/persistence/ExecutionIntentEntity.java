package com.alphamath.portfolio.infrastructure.persistence;

import com.alphamath.portfolio.domain.execution.AssetClass;
import com.alphamath.portfolio.domain.execution.ExecutionStatus;
import com.alphamath.portfolio.domain.execution.Region;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "portfolio_execution_intent")
@Data
public class ExecutionIntentEntity {
  @Id
  private String id;

  @Column(nullable = false)
  private String userId;

  @Column(nullable = false)
  private String proposalId;

  @Column(nullable = false)
  private String providerId;

  @Column(nullable = false)
  private String providerName;

  @Enumerated(EnumType.STRING)
  private Region region;

  @Enumerated(EnumType.STRING)
  private AssetClass assetClass;

  @Enumerated(EnumType.STRING)
  private ExecutionStatus status;

  private Instant createdAt;
  private String note;

  @Lob
  @Column(name = "orders_json", nullable = false)
  private String ordersJson;

  @Lob
  @Column(name = "broker_order_ids_json")
  private String brokerOrderIdsJson;
}
