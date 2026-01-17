package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrokerOrderRepository extends JpaRepository<BrokerOrderEntity, String> {
  List<BrokerOrderEntity> findByUserIdAndBrokerAccountIdOrderByUpdatedAtDesc(String userId, String brokerAccountId);
  BrokerOrderEntity findByUserIdAndExternalOrderId(String userId, String externalOrderId);
  BrokerOrderEntity findByUserIdAndBrokerAccountIdAndClientOrderId(String userId,
                                                                   String brokerAccountId,
                                                                   String clientOrderId);
  BrokerOrderEntity findByIdAndUserId(String id, String userId);
  void deleteByUserIdAndBrokerAccountId(String userId, String brokerAccountId);
}
