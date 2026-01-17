package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrokerConnectionRepository extends JpaRepository<BrokerConnectionEntity, String> {
  List<BrokerConnectionEntity> findByUserIdOrderByCreatedAtDesc(String userId);
  BrokerConnectionEntity findByIdAndUserId(String id, String userId);
}
