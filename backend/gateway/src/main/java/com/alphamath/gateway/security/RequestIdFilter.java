package com.alphamath.gateway.security;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter implements GlobalFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String requestId = exchange.getRequest().getHeaders().getFirst("X-Request-Id");
    if (requestId == null || requestId.isBlank()) {
      requestId = UUID.randomUUID().toString();
    }
    String traceId = exchange.getRequest().getHeaders().getFirst("X-Trace-Id");
    if (traceId == null || traceId.isBlank()) {
      traceId = requestId;
    }

    ServerWebExchange mutated = exchange.mutate()
        .request(r -> r.header("X-Request-Id", requestId)
                       .header("X-Trace-Id", traceId))
        .build();

    mutated.getResponse().getHeaders().add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "X-Request-Id");
    mutated.getResponse().getHeaders().add("X-Request-Id", requestId);
    mutated.getResponse().getHeaders().add("X-Trace-Id", traceId);
    return chain.filter(mutated);
  }
}
