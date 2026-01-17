package com.alphamath.portfolio.infrastructure.marketdata;

import com.alphamath.portfolio.application.marketdata.MarketDataProvider;
import com.alphamath.portfolio.domain.marketdata.MarketPrice;
import com.alphamath.portfolio.domain.marketdata.MarketQuote;
import com.alphamath.portfolio.domain.marketdata.PriceGranularity;
import com.alphamath.portfolio.domain.marketdata.PriceRange;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class HttpMarketDataProvider implements MarketDataProvider {
  private static final Logger log = LoggerFactory.getLogger(HttpMarketDataProvider.class);

  private final MarketDataHttpProperties properties;
  private final RestTemplate restTemplate;
  private final MarketDataRateLimiter rateLimiter;

  public HttpMarketDataProvider(MarketDataHttpProperties properties, RestTemplateBuilder builder) {
    this.properties = properties;
    Duration connectTimeout = Duration.ofMillis(Math.max(100, properties.getConnectTimeoutMs()));
    Duration readTimeout = Duration.ofMillis(Math.max(100, properties.getReadTimeoutMs()));
    this.restTemplate = builder.setConnectTimeout(connectTimeout).setReadTimeout(readTimeout).build();
    this.rateLimiter = new MarketDataRateLimiter(properties.getRateLimitPerMinute());
  }

  public boolean isEnabled() {
    String baseUrl = properties.getBaseUrl();
    return properties.isEnabled() && baseUrl != null && !baseUrl.isBlank();
  }

  public String getSource() {
    String source = properties.getSource();
    return source == null || source.isBlank() ? "http" : source.trim();
  }

  public String getBaseUrl() {
    return properties.getBaseUrl();
  }

  public int getMaxSymbolsPerRequest() {
    return Math.max(1, properties.getMaxSymbolsPerRequest());
  }

  public int getRateLimitPerMinute() {
    return properties.getRateLimitPerMinute();
  }

  @Override
  public Map<String, MarketQuote> getLatestQuotes(List<String> symbols) {
    Map<String, MarketQuote> out = new LinkedHashMap<>();
    if (!isEnabled() || symbols == null || symbols.isEmpty()) {
      return out;
    }
    List<List<String>> batches = chunkSymbols(symbols, getMaxSymbolsPerRequest());
    for (List<String> batch : batches) {
      HttpLatestQuotesResponse response = requestLatestQuotes(batch);
      if (response == null || response.quotes == null) {
        continue;
      }
      for (HttpQuote quote : response.quotes) {
        MarketQuote parsed = toQuote(quote);
        if (parsed != null) {
          out.put(parsed.symbol(), parsed);
        }
      }
    }
    return out;
  }

  @Override
  public List<MarketPrice> getHistoricalPrices(String symbol, PriceRange range,
                                               PriceGranularity granularity, int limit) {
    if (!isEnabled() || symbol == null || symbol.isBlank()) {
      return List.of();
    }
    String normalized = normalizeSymbol(symbol);
    HttpHistoryResponse response = requestHistory(normalized, range, granularity, limit);
    if (response == null || response.prices == null || response.prices.isEmpty()) {
      return List.of();
    }

    Instant start = range == null ? null : range.start();
    Instant end = range == null ? null : range.end();
    List<MarketPrice> out = new ArrayList<>();
    for (HttpPrice price : response.prices) {
      MarketPrice parsed = toPrice(price, normalized);
      if (parsed == null) {
        continue;
      }
      Instant ts = parsed.timestamp();
      if (start != null && ts.isBefore(start)) {
        continue;
      }
      if (end != null && ts.isAfter(end)) {
        continue;
      }
      out.add(parsed);
    }
    if (out.isEmpty()) {
      return List.of();
    }
    out.sort(Comparator.comparing(MarketPrice::timestamp));
    if (limit > 0 && out.size() > limit) {
      return out.subList(out.size() - limit, out.size());
    }
    return out;
  }

  private HttpLatestQuotesResponse requestLatestQuotes(List<String> symbols) {
    if (!rateLimiter.tryAcquire()) {
      log.warn("HTTP market data rate limit reached");
      return null;
    }
    String url = buildUrl(properties.getLatestQuotesPath());
    if (url.isBlank()) {
      return null;
    }
    String joined = String.join(",", symbols);
    String uri = UriComponentsBuilder.fromHttpUrl(url)
        .queryParam("symbols", joined)
        .toUriString();
    try {
      ResponseEntity<HttpLatestQuotesResponse> response = restTemplate.exchange(
          uri, HttpMethod.GET, buildHeaders(), HttpLatestQuotesResponse.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        log.warn("HTTP market data latest quotes failed: {}", response.getStatusCode());
        return null;
      }
      return response.getBody();
    } catch (RestClientException e) {
      log.warn("HTTP market data latest quotes failed: {}", e.getMessage());
      return null;
    }
  }

  private HttpHistoryResponse requestHistory(String symbol, PriceRange range,
                                             PriceGranularity granularity, int limit) {
    if (!rateLimiter.tryAcquire()) {
      log.warn("HTTP market data rate limit reached");
      return null;
    }
    String url = buildUrl(properties.getHistoryPath());
    if (url.isBlank()) {
      return null;
    }
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
        .queryParam("symbol", symbol);
    if (range != null) {
      if (range.start() != null) {
        builder.queryParam("start", range.start().toString());
      }
      if (range.end() != null) {
        builder.queryParam("end", range.end().toString());
      }
    }
    if (granularity != null) {
      builder.queryParam("granularity", granularity.name());
    }
    if (limit > 0) {
      builder.queryParam("limit", limit);
    }
    try {
      ResponseEntity<HttpHistoryResponse> response = restTemplate.exchange(
          builder.toUriString(), HttpMethod.GET, buildHeaders(), HttpHistoryResponse.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        log.warn("HTTP market data history failed: {}", response.getStatusCode());
        return null;
      }
      return response.getBody();
    } catch (RestClientException e) {
      log.warn("HTTP market data history failed: {}", e.getMessage());
      return null;
    }
  }

  private HttpEntity<Void> buildHeaders() {
    HttpHeaders headers = new HttpHeaders();
    String key = properties.getApiKey();
    String header = properties.getApiKeyHeader();
    if (header != null && !header.isBlank() && key != null && !key.isBlank()) {
      headers.set(header.trim(), key.trim());
    }
    return new HttpEntity<>(headers);
  }

  private String buildUrl(String path) {
    String baseUrl = properties.getBaseUrl();
    if (baseUrl == null || baseUrl.isBlank()) {
      return "";
    }
    String base = baseUrl.trim();
    String suffix = path == null ? "" : path.trim();
    if (suffix.isEmpty()) {
      return base;
    }
    if (base.endsWith("/") && suffix.startsWith("/")) {
      return base.substring(0, base.length() - 1) + suffix;
    }
    if (!base.endsWith("/") && !suffix.startsWith("/")) {
      return base + "/" + suffix;
    }
    return base + suffix;
  }

  private List<List<String>> chunkSymbols(List<String> symbols, int maxSymbols) {
    List<List<String>> out = new ArrayList<>();
    if (symbols == null || symbols.isEmpty()) {
      return out;
    }
    int safeMax = Math.max(1, maxSymbols);
    List<String> current = new ArrayList<>(safeMax);
    for (String symbol : symbols) {
      if (symbol == null || symbol.isBlank()) {
        continue;
      }
      current.add(symbol);
      if (current.size() >= safeMax) {
        out.add(current);
        current = new ArrayList<>(safeMax);
      }
    }
    if (!current.isEmpty()) {
      out.add(current);
    }
    return out;
  }

  private MarketQuote toQuote(HttpQuote quote) {
    if (quote == null) {
      return null;
    }
    String symbol = normalizeSymbol(quote.symbol);
    if (symbol == null) {
      return null;
    }
    Instant ts = parseTimestamp(quote.timestamp);
    if (ts == null) {
      return null;
    }
    Double price = quote.price;
    if (!isFinite(price) || price <= 0.0) {
      return null;
    }
    String source = quote.source == null || quote.source.isBlank() ? getSource() : quote.source.trim();
    return new MarketQuote(symbol, ts, price, source);
  }

  private MarketPrice toPrice(HttpPrice price, String fallbackSymbol) {
    if (price == null) {
      return null;
    }
    String symbol = normalizeSymbol(price.symbol);
    if (symbol == null) {
      symbol = fallbackSymbol;
    }
    Instant ts = parseTimestamp(price.timestamp);
    if (ts == null) {
      return null;
    }
    if (!isFinite(price.open) || !isFinite(price.high) || !isFinite(price.low) || !isFinite(price.close)) {
      return null;
    }
    if (price.open <= 0.0 || price.high <= 0.0 || price.low <= 0.0 || price.close <= 0.0) {
      return null;
    }
    if (price.high < Math.max(price.open, price.close) || price.low > Math.min(price.open, price.close)) {
      return null;
    }
    Double volume = price.volume;
    String source = price.source == null || price.source.isBlank() ? getSource() : price.source.trim();
    return new MarketPrice(symbol, ts, price.open, price.high, price.low, price.close, volume, source);
  }

  private String normalizeSymbol(String symbol) {
    if (symbol == null || symbol.isBlank()) {
      return null;
    }
    return symbol.trim().toUpperCase(Locale.US);
  }

  private Instant parseTimestamp(String raw) {
    if (raw == null || raw.isBlank()) {
      return null;
    }
    String ts = raw.trim();
    try {
      return Instant.parse(ts);
    } catch (DateTimeParseException ignored) {
      try {
        return LocalDate.parse(ts).atStartOfDay(ZoneOffset.UTC).toInstant();
      } catch (DateTimeParseException e) {
        return null;
      }
    }
  }

  private boolean isFinite(Double value) {
    return value != null && Double.isFinite(value);
  }

  public static class HttpLatestQuotesResponse {
    public List<HttpQuote> quotes = new ArrayList<>();
  }

  public static class HttpHistoryResponse {
    public List<HttpPrice> prices = new ArrayList<>();
  }

  public static class HttpQuote {
    public String symbol;
    public String timestamp;
    public Double price;
    public String source;
  }

  public static class HttpPrice {
    public String symbol;
    public String timestamp;
    public Double open;
    public Double high;
    public Double low;
    public Double close;
    public Double volume;
    public String source;
  }
}
