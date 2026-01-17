package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResearchNoteRepository extends JpaRepository<ResearchNoteEntity, String> {
  List<ResearchNoteEntity> findByUserIdOrderByPublishedAtDesc(String userId, PageRequest page);
  List<ResearchNoteEntity> findByUserIdAndSourceOrderByPublishedAtDesc(String userId, String source, PageRequest page);
}
