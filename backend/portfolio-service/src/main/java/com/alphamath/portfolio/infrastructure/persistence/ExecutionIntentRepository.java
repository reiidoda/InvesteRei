package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecutionIntentRepository extends JpaRepository<ExecutionIntentEntity, String> {
  List<ExecutionIntentEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
