package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CorporateActionRepository extends JpaRepository<CorporateActionEntity, String> {
  List<CorporateActionEntity> findByUserIdOrderByCreatedAtDesc(String userId, PageRequest page);
  List<CorporateActionEntity> findByUserIdAndSymbolOrderByCreatedAtDesc(String userId, String symbol, PageRequest page);
}
