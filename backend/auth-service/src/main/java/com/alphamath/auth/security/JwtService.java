package com.alphamath.auth.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
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

  public String issueToken(long uid, String email, List<String> roles, boolean mfaEnabled) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(ttlMinutes * 60);

    return Jwts.builder()
        .issuer(issuer)
        .subject(String.valueOf(uid))
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .claims(Map.of(
            "uid", uid,
            "email", email,
            "roles", roles == null ? List.of() : roles,
            "mfa", mfaEnabled
        ))
        .signWith(key)
        .compact();
  }

  public Claims parseToken(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
}
