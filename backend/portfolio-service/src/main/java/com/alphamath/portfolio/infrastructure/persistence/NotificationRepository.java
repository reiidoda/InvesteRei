package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, String> {
  List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable page);
  List<NotificationEntity> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status, Pageable page);
}
