package com.medpay.payment.idempotency;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medpay.common.domain.ApiResponse;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.util.CryptoUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdempotencyInterceptor implements HandlerInterceptor {

    private static final String IDEMPOTENCY_HEADER = "Idempotency-Key";
    private static final String ATTR_KEY = "idempotency_key";

    private final IdempotencyKeyRepository repository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        Idempotent annotation = handlerMethod.getMethodAnnotation(Idempotent.class);
        if (annotation == null) {
            return true;
        }

        String idempotencyKey = request.getHeader(IDEMPOTENCY_HEADER);
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            response.setStatus(400);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(
                    ApiResponse.fail(ErrorCode.IDEMPOTENCY_KEY_MISSING)));
            return false;
        }

        String requestBody = "";
        if (request instanceof ContentCachingRequestWrapper wrapper) {
            requestBody = new String(wrapper.getContentAsByteArray());
        }
        String requestHash = CryptoUtil.sha256Hash(request.getRequestURI() + "|" + requestBody);

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(annotation.expireSeconds());
        int inserted = repository.tryInsert(idempotencyKey, requestHash, expiresAt);

        if (inserted > 0) {
            request.setAttribute(ATTR_KEY, idempotencyKey);
            return true;
        }

        // Key already exists
        Optional<IdempotencyKeyEntity> existing = repository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            IdempotencyKeyEntity entity = existing.get();
            if ("COMPLETED".equals(entity.getStatus()) && entity.getResponseBody() != null) {
                response.setStatus(entity.getResponseStatus());
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write(entity.getResponseBody());
                log.info("Idempotency cache hit: key={}", idempotencyKey);
                return false;
            }
            // Still processing
            response.setStatus(409);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(
                    ApiResponse.fail(ErrorCode.IDEMPOTENCY_CONFLICT)));
            return false;
        }

        request.setAttribute(ATTR_KEY, idempotencyKey);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        String idempotencyKey = (String) request.getAttribute(ATTR_KEY);
        if (idempotencyKey == null) {
            return;
        }
        try {
            String responseBody = "";
            if (response instanceof ContentCachingResponseWrapper wrapper) {
                responseBody = new String(wrapper.getContentAsByteArray());
            }
            repository.updateCompleted(idempotencyKey, response.getStatus(), responseBody);
            log.debug("Idempotency completed: key={}, status={}", idempotencyKey, response.getStatus());
        } catch (Exception e) {
            log.error("Failed to update idempotency status: key={}", idempotencyKey, e);
        }
    }
}
