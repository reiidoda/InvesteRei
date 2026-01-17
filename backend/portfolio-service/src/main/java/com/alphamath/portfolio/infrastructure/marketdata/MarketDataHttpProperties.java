package com.alphamath.portfolio.infrastructure.marketdata;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "alphamath.marketdata.http")
public class MarketDataHttpProperties {
  private boolean enabled = false;
  private String baseUrl = "";
  private String latestQuotesPath = "/quotes/latest";
  private String historyPath = "/history";
  private String apiKeyHeader = "X-API-KEY";
  private String apiKey = "";
  private int connectTimeoutMs = 2000;
  private int readTimeoutMs = 4000;
  private int maxSymbolsPerRequest = 50;
  private int rateLimitPerMinute = 120;
  private String source = "http";

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  public String getLatestQuotesPath() {
    return latestQuotesPath;
  }

  public void setLatestQuotesPath(String latestQuotesPath) {
    this.latestQuotesPath = latestQuotesPath;
  }

  public String getHistoryPath() {
    return historyPath;
  }

  public void setHistoryPath(String historyPath) {
    this.historyPath = historyPath;
  }

  public String getApiKeyHeader() {
    return apiKeyHeader;
  }

  public void setApiKeyHeader(String apiKeyHeader) {
    this.apiKeyHeader = apiKeyHeader;
  }

  public String getApiKey() {
    return apiKey;
  }

  public void setApiKey(String apiKey) {
    this.apiKey = apiKey;
  }

  public int getConnectTimeoutMs() {
    return connectTimeoutMs;
  }

  public void setConnectTimeoutMs(int connectTimeoutMs) {
    this.connectTimeoutMs = connectTimeoutMs;
  }

  public int getReadTimeoutMs() {
    return readTimeoutMs;
  }

  public void setReadTimeoutMs(int readTimeoutMs) {
    this.readTimeoutMs = readTimeoutMs;
  }

  public int getMaxSymbolsPerRequest() {
    return maxSymbolsPerRequest;
  }

  public void setMaxSymbolsPerRequest(int maxSymbolsPerRequest) {
    this.maxSymbolsPerRequest = maxSymbolsPerRequest;
  }

  public int getRateLimitPerMinute() {
    return rateLimitPerMinute;
  }

  public void setRateLimitPerMinute(int rateLimitPerMinute) {
    this.rateLimitPerMinute = rateLimitPerMinute;
  }

  public String getSource() {
    return source;
  }

  public void setSource(String source) {
    this.source = source;
  }
}
