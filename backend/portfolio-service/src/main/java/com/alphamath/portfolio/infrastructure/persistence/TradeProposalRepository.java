package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TradeProposalRepository extends JpaRepository<TradeProposalEntity, String> {
  List<TradeProposalEntity> findByUserIdOrderByCreatedAtDesc(String userId);
  List<TradeProposalEntity> findByUserIdAndOrgIdOrderByCreatedAtDesc(String userId, String orgId);
}
