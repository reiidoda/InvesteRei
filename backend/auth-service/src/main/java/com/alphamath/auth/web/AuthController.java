package com.alphamath.auth.web;

import com.alphamath.auth.security.JwtService;
import com.alphamath.auth.user.UserEntity;
import com.alphamath.auth.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final UserRepository users;
  private final JwtService jwt;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public AuthController(UserRepository users, JwtService jwt) {
    this.users = users;
    this.jwt = jwt;
  }

  @PostMapping("/register")
  public TokenResponse register(@Valid @RequestBody RegisterRequest req) {
    if (users.existsByEmail(req.email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }

    UserEntity u = new UserEntity();
    u.setEmail(req.email.toLowerCase().trim());
    u.setPasswordHash(encoder.encode(req.password));
    u = users.save(u);

    String token = jwt.issueToken(u.getId(), u.getEmail());
    return new TokenResponse(token);
  }

  @PostMapping("/login")
  public TokenResponse login(@Valid @RequestBody LoginRequest req) {
    UserEntity u = users.findByEmail(req.email.toLowerCase().trim())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (!encoder.matches(req.password, u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    String token = jwt.issueToken(u.getId(), u.getEmail());
    return new TokenResponse(token);
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
  }
}
