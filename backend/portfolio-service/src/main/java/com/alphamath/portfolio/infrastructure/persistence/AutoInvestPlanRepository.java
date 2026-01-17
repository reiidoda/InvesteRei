package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AutoInvestPlanRepository extends JpaRepository<AutoInvestPlanEntity, String> {
  List<AutoInvestPlanEntity> findByUserIdOrderByCreatedAtDesc(String userId);
  List<AutoInvestPlanEntity> findByStatusOrderByCreatedAtAsc(String status);
}
