package com.medpay.user.service;

import com.medpay.common.constant.UserRole;
import com.medpay.user.domain.UserAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtService(
            @Value("${medpay.jwt.secret}") String secret,
            @Value("${medpay.jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${medpay.jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(UserAccount user, UUID hospitalId) {
        return buildToken(user, hospitalId, accessTokenExpiration);
    }

    public String generateRefreshToken(UserAccount user, UUID hospitalId) {
        return buildToken(user, hospitalId, refreshTokenExpiration);
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    private String buildToken(UserAccount user, UUID hospitalId, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        var builder = Jwts.builder()
                .subject(user.getId().toString())
                .claim("role", user.getRole().name())
                .claim("username", user.getUsername())
                .issuedAt(now)
                .expiration(expiryDate);

        if (hospitalId != null) {
            builder.claim("hospitalId", hospitalId.toString());
        }

        return builder.signWith(secretKey).compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseToken(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    public UserRole extractRole(String token) {
        return UserRole.valueOf(parseToken(token).get("role", String.class));
    }

    public UUID extractHospitalId(String token) {
        String hospitalId = parseToken(token).get("hospitalId", String.class);
        return hospitalId != null ? UUID.fromString(hospitalId) : null;
    }
}
