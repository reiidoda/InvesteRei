package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditEventRepository extends JpaRepository<AuditEventEntity, String> {
  List<AuditEventEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
  List<AuditEventEntity> findByUserIdAndEventTypeOrderByCreatedAtDesc(String userId, String eventType, Pageable pageable);
  List<AuditEventEntity> findByUserIdAndEntityIdOrderByCreatedAtDesc(String userId, String entityId, Pageable pageable);
}
