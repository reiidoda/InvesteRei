package com.alphamath.portfolio.funding;

import lombok.Data;

@Data
public class FundingVerifyRequest {
  private String verificationMode;
  private String code;
}
