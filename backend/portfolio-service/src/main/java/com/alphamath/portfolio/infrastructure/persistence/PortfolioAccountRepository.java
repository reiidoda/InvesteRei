package com.alphamath.portfolio.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PortfolioAccountRepository extends JpaRepository<PortfolioAccountEntity, String> {
  Optional<PortfolioAccountEntity> findByUserIdAndAccountType(String userId, String accountType);
}
