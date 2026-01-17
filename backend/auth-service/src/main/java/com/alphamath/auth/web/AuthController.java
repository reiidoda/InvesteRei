package com.alphamath.auth.web;

import com.alphamath.auth.security.AuthBootstrapProperties;
import com.alphamath.auth.security.JwtService;
import com.alphamath.auth.user.UserEntity;
import com.alphamath.auth.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final UserRepository users;
  private final JwtService jwt;
  private final AuthBootstrapProperties bootstrap;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public AuthController(UserRepository users, JwtService jwt, AuthBootstrapProperties bootstrap) {
    this.users = users;
    this.jwt = jwt;
    this.bootstrap = bootstrap;
  }

  @PostMapping("/register")
  public TokenResponse register(@Valid @RequestBody RegisterRequest req) {
    if (users.existsByEmail(req.email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }

    UserEntity u = new UserEntity();
    u.setEmail(req.email.toLowerCase().trim());
    u.setPasswordHash(encoder.encode(req.password));
    boolean bootstrapAdmin = bootstrap != null && bootstrap.isBootstrapAdmin(u.getEmail());
    u.setRoles(bootstrapAdmin ? "USER,ADMIN" : "USER");
    u = users.save(u);

    List<String> roles = parseRoles(u.getRoles());
    String token = jwt.issueToken(u.getId(), u.getEmail(), roles, u.isMfaEnabled());
    return new TokenResponse(token, roles, u.isMfaEnabled(), u.isMfaEnabled());
  }

  @PostMapping("/login")
  public TokenResponse login(@Valid @RequestBody LoginRequest req) {
    UserEntity u = users.findByEmail(req.email.toLowerCase().trim())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (!encoder.matches(req.password, u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    if (bootstrap != null && bootstrap.isBootstrapAdmin(u.getEmail()) && !hasRole(u.getRoles(), "ADMIN")) {
      List<String> upgraded = new java.util.ArrayList<>(parseRoles(u.getRoles()));
      upgraded.add("ADMIN");
      u.setRoles(normalizeRoles(upgraded));
      users.save(u);
    }

    List<String> roles = parseRoles(u.getRoles());
    String token = jwt.issueToken(u.getId(), u.getEmail(), roles, u.isMfaEnabled());
    return new TokenResponse(token, roles, u.isMfaEnabled(), u.isMfaEnabled());
  }

  @GetMapping("/profile")
  public UserProfile profile(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String auth) {
    UserEntity user = requireUser(auth);
    UserProfile profile = new UserProfile();
    profile.id = user.getId();
    profile.email = user.getEmail();
    profile.roles = parseRoles(user.getRoles());
    profile.mfaEnabled = user.isMfaEnabled();
    profile.mfaMethod = user.getMfaMethod();
    profile.mfaEnrolledAt = user.getMfaEnrolledAt();
    profile.mfaVerifiedAt = user.getMfaVerifiedAt();
    profile.createdAt = user.getCreatedAt();
    return profile;
  }

  @PostMapping("/mfa/enroll")
  public MfaEnrollResponse enroll(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String auth,
                                  @Valid @RequestBody MfaEnrollRequest req) {
    UserEntity user = requireUser(auth);
    String method = req.method == null ? "TOTP" : req.method.trim().toUpperCase(Locale.US);
    String secret = "SIM-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    user.setMfaMethod(method);
    user.setMfaSecret(secret);
    user.setMfaEnrolledAt(Instant.now());
    users.save(user);

    MfaEnrollResponse response = new MfaEnrollResponse();
    response.method = method;
    response.enrolledAt = user.getMfaEnrolledAt();
    response.secretMasked = maskSecret(secret);
    response.note = "Stub enrollment. Replace with real TOTP/SMS provider before production.";
    return response;
  }

  @PostMapping("/mfa/verify")
  public MfaStatusResponse verify(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String auth,
                                  @Valid @RequestBody MfaVerifyRequest req) {
    UserEntity user = requireUser(auth);
    if (req.code == null || req.code.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "code is required");
    }
    if (!"000000".equals(req.code.trim())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid MFA code (stub expects 000000)");
    }
    user.setMfaEnabled(true);
    user.setMfaVerifiedAt(Instant.now());
    users.save(user);
    return buildMfaStatus(user);
  }

  @PostMapping("/mfa/disable")
  public MfaStatusResponse disable(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String auth) {
    UserEntity user = requireUser(auth);
    user.setMfaEnabled(false);
    user.setMfaVerifiedAt(null);
    users.save(user);
    return buildMfaStatus(user);
  }

  @PostMapping("/users/{id}/roles")
  public UserRoleResponse updateRoles(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String auth,
                                      @PathVariable Long id,
                                      @Valid @RequestBody RoleUpdateRequest req) {
    requireAdmin(auth);
    UserEntity target = users.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    String normalized = normalizeRoles(req.roles);
    target.setRoles(normalized);
    users.save(target);
    UserRoleResponse response = new UserRoleResponse();
    response.id = target.getId();
    response.email = target.getEmail();
    response.roles = parseRoles(target.getRoles());
    response.updatedAt = Instant.now();
    return response;
  }

  @Data
  static class RegisterRequest {
    @Email @NotBlank
    public String email;

    @NotBlank @Size(min = 8, max = 72)
    public String password;
  }

  @Data
  static class LoginRequest {
    @Email @NotBlank
    public String email;

    @NotBlank @Size(min = 8, max = 72)
    public String password;
  }

  @Data
  static class TokenResponse {
    public final String token;
    public final List<String> roles;
    public final boolean mfaEnabled;
    public final boolean mfaRequired;
  }

  @Data
  static class UserProfile {
    public Long id;
    public String email;
    public List<String> roles;
    public boolean mfaEnabled;
    public String mfaMethod;
    public Instant mfaEnrolledAt;
    public Instant mfaVerifiedAt;
    public Instant createdAt;
  }

  @Data
  static class MfaEnrollRequest {
    public String method;
  }

  @Data
  static class MfaEnrollResponse {
    public String method;
    public String secretMasked;
    public Instant enrolledAt;
    public String note;
  }

  @Data
  static class MfaVerifyRequest {
    @NotBlank
    public String code;
  }

  @Data
  static class MfaStatusResponse {
    public boolean mfaEnabled;
    public String mfaMethod;
    public Instant mfaEnrolledAt;
    public Instant mfaVerifiedAt;
  }

  @Data
  static class RoleUpdateRequest {
    @Size(min = 1, max = 10)
    public List<@NotBlank String> roles;
  }

  @Data
  static class UserRoleResponse {
    public Long id;
    public String email;
    public List<String> roles;
    public Instant updatedAt;
  }

  private UserEntity requireUser(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token");
    }
    String token = authHeader.substring("Bearer ".length()).trim();
    try {
      String uid = String.valueOf(jwt.parseToken(token).get("uid", ""));
      Long id = Long.parseLong(uid);
      return users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
  }

  private void requireAdmin(String authHeader) {
    UserEntity user = requireUser(authHeader);
    if (!hasRole(user.getRoles(), "ADMIN")) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required");
    }
  }

  private List<String> parseRoles(String roles) {
    if (roles == null || roles.isBlank()) {
      return List.of("USER");
    }
    return java.util.Arrays.stream(roles.split(","))
        .map(String::trim)
        .filter(r -> !r.isEmpty())
        .map(r -> r.toUpperCase(Locale.US))
        .toList();
  }

  private boolean hasRole(String roles, String required) {
    if (required == null || required.isBlank()) {
      return true;
    }
    String needle = required.trim().toUpperCase(Locale.US);
    return parseRoles(roles).stream().anyMatch(r -> r.equals(needle));
  }

  private MfaStatusResponse buildMfaStatus(UserEntity user) {
    MfaStatusResponse response = new MfaStatusResponse();
    response.mfaEnabled = user.isMfaEnabled();
    response.mfaMethod = user.getMfaMethod();
    response.mfaEnrolledAt = user.getMfaEnrolledAt();
    response.mfaVerifiedAt = user.getMfaVerifiedAt();
    return response;
  }

  private String normalizeRoles(List<String> roles) {
    if (roles == null || roles.isEmpty()) {
      return "USER";
    }
    List<String> normalized = roles.stream()
        .filter(r -> r != null && !r.isBlank())
        .map(r -> r.trim().toUpperCase(Locale.US))
        .distinct()
        .toList();
    boolean hasUser = normalized.stream().anyMatch(r -> r.equals("USER"));
    String joined;
    if (hasUser) {
      joined = String.join(",", normalized);
    } else {
      List<String> withUser = new java.util.ArrayList<>(normalized);
      withUser.add("USER");
      joined = String.join(",", withUser);
    }
    return joined.isBlank() ? "USER" : joined;
  }

  private String maskSecret(String secret) {
    if (secret == null || secret.length() < 4) {
      return "****";
    }
    String tail = secret.substring(secret.length() - 4);
    return "****" + tail;
  }
}
