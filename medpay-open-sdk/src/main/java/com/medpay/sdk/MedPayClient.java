package com.medpay.sdk;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * MedPay Open API SDK Client.
 * 外部系统通过此客户端调用 MedPay 开放平台接口。
 *
 * <pre>
 * MedPayClient client = new MedPayClient("http://medpay:8080", "ext-his-001", "test-secret-001");
 *
 * // 创建订单
 * Map<String, Object> order = client.createOrder(Map.of(
 *     "externalOrderId", "MY-ORD-001",
 *     "externalPatientId", "MY-PAT-001",
 *     "patientName", "张三",
 *     "orderType", "MEDICINE",
 *     "items", List.of(Map.of(
 *         "externalProductId", "MY-MED-001",
 *         "name", "阿莫西林胶囊",
 *         "price", 15.00,
 *         "quantity", 2
 *     ))
 * ));
 *
 * // 发起支付
 * Map<String, Object> payment = client.initiatePayment("MY-ORD-001", "MOCK");
 * </pre>
 */
public class MedPayClient {

    private final String baseUrl;
    private final String authHeader;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public MedPayClient(String baseUrl, String clientId, String clientSecret) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.authHeader = "ApiKey " + Base64.getEncoder().encodeToString(
                (clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    // ==================== Order ====================

    public Map<String, Object> createOrder(Map<String, Object> request) throws Exception {
        return post("/api/v1/open/orders", request);
    }

    public Map<String, Object> getOrder(String externalOrderId) throws Exception {
        return get("/api/v1/open/orders/" + externalOrderId);
    }

    public Map<String, Object> initiatePayment(String externalOrderId, String paymentChannel) throws Exception {
        return post("/api/v1/open/orders/" + externalOrderId + "/pay",
                Map.of("paymentChannel", paymentChannel));
    }

    public Map<String, Object> cancelOrder(String externalOrderId, String reason) throws Exception {
        return put("/api/v1/open/orders/" + externalOrderId + "/cancel",
                Map.of("reason", reason != null ? reason : "外部系统取消"));
    }

    public Map<String, Object> requestRefund(String externalOrderId, BigDecimal amount, String reason) throws Exception {
        return post("/api/v1/open/orders/" + externalOrderId + "/refund",
                Map.of("refundAmount", amount, "refundReason", reason != null ? reason : "退款"));
    }

    public Map<String, Object> getPaymentStatus(String externalOrderId) throws Exception {
        return get("/api/v1/open/orders/" + externalOrderId + "/payment-status");
    }

    // ==================== Insurance ====================

    public Map<String, Object> calculateInsurance(String externalOrderId) throws Exception {
        return post("/api/v1/open/insurance/calculate",
                Map.of("externalOrderId", externalOrderId));
    }

    // ==================== HTTP Methods ====================

    private Map<String, Object> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Authorization", authHeader)
                .header("Accept", "application/json")
                .GET()
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return handleResponse(response);
    }

    private Map<String, Object> post(String path, Object body) throws Exception {
        String json = objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Authorization", authHeader)
                .header("Content-Type", "application/json;charset=UTF-8")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return handleResponse(response);
    }

    private Map<String, Object> put(String path, Object body) throws Exception {
        String json = objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Authorization", authHeader)
                .header("Content-Type", "application/json;charset=UTF-8")
                .header("Accept", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return handleResponse(response);
    }

    private Map<String, Object> handleResponse(HttpResponse<String> response) throws Exception {
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return objectMapper.readValue(response.body(), new TypeReference<>() {});
        }
        throw new MedPayApiException(response.statusCode(), response.body());
    }

    public static class MedPayApiException extends Exception {
        private final int httpStatus;
        private final String responseBody;

        public MedPayApiException(int httpStatus, String responseBody) {
            super("MedPay API Error: HTTP " + httpStatus + " - " + responseBody);
            this.httpStatus = httpStatus;
            this.responseBody = responseBody;
        }

        public int getHttpStatus() { return httpStatus; }
        public String getResponseBody() { return responseBody; }
    }
}
