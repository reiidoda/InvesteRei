export const API_BASE = (window as any).__API_BASE__ || 'http://localhost:8080';

export type TokenResponse = {
  token: string | null;
  roles?: string[];
  mfaEnabled?: boolean;
  mfaRequired?: boolean;
  mfaToken?: string | null;
  mfaTokenExpiresAt?: string | null;
};

export type MfaStatusResponse = {
  mfaEnabled?: boolean;
  mfaMethod?: string | null;
  mfaEnrolledAt?: string | null;
  mfaVerifiedAt?: string | null;
  token?: string | null;
  roles?: string[];
  mfaRequired?: boolean;
};

export type OptimizeRequest = {
  mu: number[];
  cov: number[][];
  method?: string;
  riskAversion?: number;
  maxWeight?: number;
  minWeight?: number;
};

export type OptimizeResponse = {
  weights: number[];
  expectedReturn: number;
  variance: number;
  disclaimer: string;
};
