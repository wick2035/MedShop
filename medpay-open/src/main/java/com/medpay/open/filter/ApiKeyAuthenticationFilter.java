package com.medpay.open.filter;

import com.medpay.common.security.ApiClientContext;
import com.medpay.common.security.TenantContext;
import com.medpay.open.domain.ApiClient;
import com.medpay.open.repository.ApiClientRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final String API_KEY_PREFIX = "ApiKey ";
    private static final String OPEN_API_PATH = "/api/v1/open/";

    private final ApiClientRepository apiClientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith(OPEN_API_PATH);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith(API_KEY_PREFIX)) {
            sendError(response, 401, "Missing or invalid Authorization header. Expected: ApiKey <base64(clientId:clientSecret)>");
            return;
        }

        try {
            String base64Credentials = authHeader.substring(API_KEY_PREFIX.length()).trim();
            String decoded = new String(Base64.getDecoder().decode(base64Credentials), StandardCharsets.UTF_8);

            int colonIdx = decoded.indexOf(':');
            if (colonIdx <= 0) {
                sendError(response, 401, "Invalid ApiKey format. Expected base64(clientId:clientSecret)");
                return;
            }

            String clientId = decoded.substring(0, colonIdx);
            String clientSecret = decoded.substring(colonIdx + 1);

            ApiClient apiClient = apiClientRepository.findByClientIdAndStatus(clientId, "ACTIVE")
                    .orElse(null);

            if (apiClient == null) {
                sendError(response, 401, "Invalid API client or client is inactive");
                return;
            }

            if (!passwordEncoder.matches(clientSecret, apiClient.getClientSecret())) {
                sendError(response, 401, "Invalid client secret");
                return;
            }

            // Set SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            clientId, null,
                            List.of(new SimpleGrantedAuthority("ROLE_API_CLIENT"))
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Set TenantContext
            TenantContext.setCurrentHospitalId(apiClient.getHospitalId());

            // Set ApiClientContext
            String perms = apiClient.getPermissions() != null ? apiClient.getPermissions() : "ORDER,PAYMENT,INSURANCE";
            Set<String> permissions = Set.of(perms.split(","));
            ApiClientContext.set(new ApiClientContext.ApiClientInfo(
                    apiClient.getClientId(),
                    apiClient.getClientName(),
                    permissions,
                    apiClient.getCallbackUrl(),
                    apiClient.getCallbackSecret()
            ));

            filterChain.doFilter(request, response);

        } catch (IllegalArgumentException e) {
            sendError(response, 401, "Invalid Base64 encoding in ApiKey");
        } finally {
            ApiClientContext.clear();
            TenantContext.clear();
        }
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(String.format("{\"code\":%d,\"message\":\"%s\"}", status, message));
    }
}
