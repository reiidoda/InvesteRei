package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrokerPositionRepository extends JpaRepository<BrokerPositionEntity, String> {
  List<BrokerPositionEntity> findByUserIdAndBrokerAccountIdOrderByUpdatedAtDesc(String userId, String brokerAccountId);
  void deleteByUserIdAndBrokerAccountId(String userId, String brokerAccountId);
}
