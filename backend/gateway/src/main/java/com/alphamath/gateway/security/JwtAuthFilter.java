package com.alphamath.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class JwtAuthFilter implements GlobalFilter {

  private final SecretKey key;

  public JwtAuthFilter(@Value("${alphamath.jwt.secret}") String secret) {
    // Ensure at least 32 bytes for HS256
    String padded = secret;
    while (padded.getBytes(StandardCharsets.UTF_8).length < 32) padded += "_";
    this.key = Keys.hmacShaKeyFor(padded.getBytes(StandardCharsets.UTF_8));
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getURI().getPath();

    // Public endpoints
    if (path.startsWith("/api/v1/auth/") || path.equals("/actuator/health")) {
      return chain.filter(exchange);
    }

    // Protected: require Bearer token
    String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
    if (auth == null || !auth.startsWith("Bearer ")) {
      exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
      return exchange.getResponse().setComplete();
    }

    String token = auth.substring("Bearer ".length()).trim();
    try {
      Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
      String rolesHeader = rolesHeader(claims.get("roles"));
      String mfaHeader = String.valueOf(claims.get("mfa", ""));

      // You can propagate user info downstream as headers:
      ServerWebExchange mutated = exchange.mutate()
          .request(r -> r.header("X-User-Id", String.valueOf(claims.get("uid", "")))
                         .header("X-User-Email", String.valueOf(claims.get("email", "")))
                         .header("X-User-Roles", rolesHeader)
                         .header("X-User-Mfa", mfaHeader))
          .build();

      return chain.filter(mutated);
    } catch (Exception e) {
      exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
      return exchange.getResponse().setComplete();
    }
  }

  private String rolesHeader(Object claim) {
    if (claim == null) return "";
    if (claim instanceof java.util.List<?> list) {
      return list.stream().map(Object::toString).reduce((a, b) -> a + "," + b).orElse("");
    }
    return claim.toString();
  }
}
