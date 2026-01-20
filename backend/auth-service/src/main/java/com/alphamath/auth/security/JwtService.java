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
  private final long mfaChallengeTtlMinutes;

  public JwtService(
      @Value("${alphamath.jwt.secret}") String secret,
      @Value("${alphamath.jwt.issuer}") String issuer,
      @Value("${alphamath.jwt.ttlMinutes}") long ttlMinutes,
      @Value("${alphamath.jwt.mfaChallengeTtlMinutes:5}") long mfaChallengeTtlMinutes
  ) {
    String padded = secret;
    while (padded.getBytes(StandardCharsets.UTF_8).length < 32) padded += "_";
    this.key = Keys.hmacShaKeyFor(padded.getBytes(StandardCharsets.UTF_8));
    this.issuer = issuer;
    this.ttlMinutes = ttlMinutes;
    this.mfaChallengeTtlMinutes = mfaChallengeTtlMinutes;
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
            "mfa", mfaEnabled,
            "type", "access"
        ))
        .signWith(key)
        .compact();
  }

  public MfaChallenge issueMfaChallenge(long uid, String email) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(mfaChallengeTtlMinutes * 60);
    String token = Jwts.builder()
        .issuer(issuer)
        .subject(String.valueOf(uid))
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .claims(Map.of(
            "uid", uid,
            "email", email,
            "type", "mfa_challenge"
        ))
        .signWith(key)
        .compact();
    return new MfaChallenge(token, exp);
  }

  public boolean isMfaChallenge(Claims claims) {
    if (claims == null) return false;
    Object type = claims.get("type");
    return type != null && "mfa_challenge".equals(type.toString());
  }

  public Claims parseToken(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  public static class MfaChallenge {
    private final String token;
    private final Instant expiresAt;

    public MfaChallenge(String token, Instant expiresAt) {
      this.token = token;
      this.expiresAt = expiresAt;
    }

    public String getToken() {
      return token;
    }

    public Instant getExpiresAt() {
      return expiresAt;
    }
  }
}
