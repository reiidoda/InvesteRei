package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrokerAccountRepository extends JpaRepository<BrokerAccountEntity, String> {
  List<BrokerAccountEntity> findByUserIdOrderByCreatedAtDesc(String userId);
  BrokerAccountEntity findByUserIdAndExternalAccountId(String userId, String externalAccountId);
  List<BrokerAccountEntity> findByBrokerConnectionIdOrderByCreatedAtDesc(String brokerConnectionId);
}
