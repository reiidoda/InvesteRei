package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntryEntity, String> {
  List<LedgerEntryEntity> findByUserIdAndAccountIdOrderByTradeDateDesc(String userId, String accountId, PageRequest page);
  List<LedgerEntryEntity> findByUserIdAndAccountIdAndTradeDateBetweenOrderByTradeDateAsc(String userId, String accountId,
                                                                                        Instant start, Instant end);
}
