export const API_BASE = (window as any).__API_BASE__ || 'http://localhost:8080';

export type TokenResponse = { token: string };

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
