package com.alphamath.auth.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

  private final SecretKey key;
  private final String issuer;
  private final long ttlMinutes;

  public JwtService(
      @Value("${alphamath.jwt.secret}") String secret,
      @Value("${alphamath.jwt.issuer}") String issuer,
      @Value("${alphamath.jwt.ttlMinutes}") long ttlMinutes
  ) {
    String padded = secret;
    while (padded.getBytes(StandardCharsets.UTF_8).length < 32) padded += "_";
    this.key = Keys.hmacShaKeyFor(padded.getBytes(StandardCharsets.UTF_8));
    this.issuer = issuer;
    this.ttlMinutes = ttlMinutes;
  }

  public String issueToken(long uid, String email) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(ttlMinutes * 60);

    return Jwts.builder()
        .issuer(issuer)
        .subject(String.valueOf(uid))
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .claims(Map.of("uid", uid, "email", email))
        .signWith(key)
        .compact();
  }
}
