package com.alphamath.portfolio.infrastructure.persistence;

import com.alphamath.portfolio.domain.alert.AlertStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<AlertEntity, String> {
  List<AlertEntity> findByUserIdOrderByUpdatedAtDesc(String userId, PageRequest page);
  List<AlertEntity> findByUserIdAndStatusOrderByUpdatedAtDesc(String userId, AlertStatus status, PageRequest page);
}
