package com.alphamath.portfolio.infrastructure.persistence;

import com.alphamath.portfolio.domain.reporting.TaxLotStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaxLotRepository extends JpaRepository<TaxLotEntity, String> {
  List<TaxLotEntity> findByUserIdAndAccountIdOrderByUpdatedAtDesc(String userId, String accountId, PageRequest page);
  List<TaxLotEntity> findByUserIdAndAccountIdOrderByUpdatedAtDesc(String userId, String accountId);
  List<TaxLotEntity> findByUserIdAndAccountIdAndStatusOrderByUpdatedAtDesc(String userId, String accountId,
                                                                          TaxLotStatus status, PageRequest page);
  List<TaxLotEntity> findByUserIdAndAccountIdAndSymbolOrderByUpdatedAtDesc(String userId, String accountId,
                                                                          String symbol, PageRequest page);
  void deleteByUserIdAndAccountId(String userId, String accountId);
}
