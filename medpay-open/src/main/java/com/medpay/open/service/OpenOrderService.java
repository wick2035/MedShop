package com.medpay.open.service;

import com.medpay.common.constant.EntityType;
import com.medpay.common.constant.OrderType;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.ApiClientContext;
import com.medpay.insurance.dto.InsuranceCoverageResult;
import com.medpay.insurance.service.InsuranceCalculationService;
import com.medpay.open.dto.*;
import com.medpay.order.domain.ItemType;
import com.medpay.order.domain.Order;
import com.medpay.order.domain.OrderItem;
import com.medpay.order.dto.OrderCreateRequest;
import com.medpay.order.dto.OrderItemRequest;
import com.medpay.order.dto.OrderResponse;
import com.medpay.order.service.OrderService;
import com.medpay.payment.dto.PaymentInitiateRequest;
import com.medpay.payment.dto.PaymentInitiateResponse;
import com.medpay.payment.dto.PaymentStatusResponse;
import com.medpay.payment.dto.RefundCreateRequest;
import com.medpay.payment.dto.RefundResponse;
import com.medpay.payment.service.PaymentService;
import com.medpay.payment.service.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenOrderService {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final RefundService refundService;
    private final InsuranceCalculationService insuranceCalculationService;
    private final ShadowEntityService shadowEntityService;
    private final ExternalMappingService mappingService;

    @Transactional
    public OpenOrderResponse createOrder(OpenOrderRequest request) {
        String clientId = ApiClientContext.requireClientId();

        // Idempotency: check if order already mapped
        UUID existingOrderId = mappingService.findMedpayId(clientId, EntityType.ORDER, request.getExternalOrderId())
                .orElse(null);
        if (existingOrderId != null) {
            log.info("Idempotent order creation: extId={} already mapped to medpayId={}",
                    request.getExternalOrderId(), existingOrderId);
            return getOrderByMedpayId(existingOrderId, request.getExternalOrderId());
        }

        // 1. Ensure patient exists
        UUID patientId = shadowEntityService.ensurePatientExists(
                clientId,
                request.getExternalPatientId(),
                request.getPatientName(),
                request.getPatientGender(),
                request.getPatientInsuranceType()
        );

        // 2. Ensure all products exist and build item requests
        List<OrderItemRequest> itemRequests = new ArrayList<>();
        for (OpenItemData itemData : request.getItems()) {
            UUID productId = shadowEntityService.ensureProductExists(clientId, itemData);
            itemRequests.add(new OrderItemRequest(ItemType.PRODUCT, productId, itemData.getQuantity()));
        }

        // 3. Determine order type
        OrderType orderType = parseOrderType(request.getOrderType());

        // 4. Create order via existing OrderService
        OrderCreateRequest createReq = new OrderCreateRequest(
                orderType, itemRequests, null, null, null, request.getRemark()
        );
        OrderResponse orderResponse = orderService.createOrder(createReq, patientId);

        // 5. Save order mapping
        mappingService.createMapping(clientId, EntityType.ORDER,
                request.getExternalOrderId(), orderResponse.id());

        log.info("Open API order created: extId={} -> medpayOrderNo={}",
                request.getExternalOrderId(), orderResponse.orderNo());

        return toOpenOrderResponse(orderResponse, request);
    }

    @Transactional(readOnly = true)
    public OpenOrderResponse getOrder(String externalOrderId) {
        String clientId = ApiClientContext.requireClientId();
        UUID medpayOrderId = resolveMedpayOrderId(clientId, externalOrderId);
        return getOrderByMedpayId(medpayOrderId, externalOrderId);
    }

    @Transactional
    public PaymentInitiateResponse initiatePayment(String externalOrderId, OpenPayRequest request) {
        String clientId = ApiClientContext.requireClientId();
        UUID medpayOrderId = resolveMedpayOrderId(clientId, externalOrderId);

        PaymentInitiateRequest payReq = new PaymentInitiateRequest();
        payReq.setOrderId(medpayOrderId);
        payReq.setPaymentChannel(request.getPaymentChannel());

        String idempotencyKey = request.getIdempotencyKey() != null
                ? request.getIdempotencyKey()
                : "open_" + clientId + "_" + externalOrderId;

        return paymentService.initiatePayment(payReq, idempotencyKey);
    }

    @Transactional
    public void cancelOrder(String externalOrderId, String reason) {
        String clientId = ApiClientContext.requireClientId();
        UUID medpayOrderId = resolveMedpayOrderId(clientId, externalOrderId);
        orderService.cancelOrder(medpayOrderId, reason != null ? reason : "外部系统取消");
        log.info("Open API order cancelled: extId={}", externalOrderId);
    }

    @Transactional
    public RefundResponse requestRefund(String externalOrderId, OpenRefundRequest request) {
        String clientId = ApiClientContext.requireClientId();
        UUID medpayOrderId = resolveMedpayOrderId(clientId, externalOrderId);

        RefundCreateRequest refundReq = new RefundCreateRequest();
        refundReq.setOrderId(medpayOrderId);
        refundReq.setRefundAmount(request.getRefundAmount());
        refundReq.setRefundType(request.getRefundType() != null ? request.getRefundType() : "FULL");
        refundReq.setRefundReason(request.getRefundReason() != null ? request.getRefundReason() : "外部系统退款");

        String idempotencyKey = request.getIdempotencyKey() != null
                ? request.getIdempotencyKey()
                : "open_refund_" + clientId + "_" + externalOrderId;

        // Use a deterministic UUID from the clientId for requestedBy
        UUID requestedBy = UUID.nameUUIDFromBytes(("api_client:" + clientId).getBytes());

        return refundService.requestRefund(refundReq, requestedBy, idempotencyKey);
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(String externalOrderId) {
        String clientId = ApiClientContext.requireClientId();
        UUID medpayOrderId = resolveMedpayOrderId(clientId, externalOrderId);

        Order order = orderService.findOrderById(medpayOrderId);
        var payments = paymentService.getByOrderId(order.getId());
        if (payments.isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "该订单无支付记录");
        }

        var latestPayment = payments.get(payments.size() - 1);
        return paymentService.queryPaymentStatus(latestPayment.getTransactionNo());
    }

    @Transactional
    public InsuranceCoverageResult calculateInsurance(String externalOrderId) {
        String clientId = ApiClientContext.requireClientId();
        UUID medpayOrderId = resolveMedpayOrderId(clientId, externalOrderId);
        return insuranceCalculationService.calculateAndApply(medpayOrderId);
    }

    // ==================== Internal Methods ====================

    private UUID resolveMedpayOrderId(String clientId, String externalOrderId) {
        return mappingService.findMedpayId(clientId, EntityType.ORDER, externalOrderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND,
                        "未找到外部订单映射: " + externalOrderId));
    }

    private OpenOrderResponse getOrderByMedpayId(UUID medpayOrderId, String externalOrderId) {
        OrderResponse orderResponse = orderService.getOrderDetail(medpayOrderId);
        String clientId = ApiClientContext.requireClientId();

        List<OpenOrderResponse.OpenOrderItemResponse> itemResponses = new ArrayList<>();
        if (orderResponse.items() != null) {
            for (var item : orderResponse.items()) {
                String extProductId = mappingService.findExternalId(item.referenceId())
                        .orElse(null);
                itemResponses.add(OpenOrderResponse.OpenOrderItemResponse.builder()
                        .externalProductId(extProductId)
                        .name(item.name())
                        .quantity(item.quantity())
                        .unitPrice(item.unitPrice())
                        .subtotal(item.subtotal())
                        .insuranceAmount(item.insuranceAmount())
                        .selfPayAmount(item.selfPayAmount())
                        .build());
            }
        }

        return OpenOrderResponse.builder()
                .externalOrderId(externalOrderId)
                .medpayOrderId(medpayOrderId)
                .medpayOrderNo(orderResponse.orderNo())
                .status(orderResponse.status())
                .totalAmount(orderResponse.totalAmount())
                .insuranceAmount(orderResponse.insuranceAmount())
                .selfPayAmount(orderResponse.selfPayAmount())
                .items(itemResponses)
                .createdAt(orderResponse.createdAt())
                .expireAt(orderResponse.expireAt())
                .build();
    }

    private OpenOrderResponse toOpenOrderResponse(OrderResponse orderResponse, OpenOrderRequest request) {
        List<OpenOrderResponse.OpenOrderItemResponse> itemResponses = new ArrayList<>();
        var orderItems = orderResponse.items();
        var requestItems = request.getItems();

        for (int i = 0; i < orderItems.size(); i++) {
            var item = orderItems.get(i);
            String extProductId = i < requestItems.size()
                    ? requestItems.get(i).getExternalProductId() : null;

            itemResponses.add(OpenOrderResponse.OpenOrderItemResponse.builder()
                    .externalProductId(extProductId)
                    .name(item.name())
                    .quantity(item.quantity())
                    .unitPrice(item.unitPrice())
                    .subtotal(item.subtotal())
                    .insuranceAmount(item.insuranceAmount())
                    .selfPayAmount(item.selfPayAmount())
                    .build());
        }

        return OpenOrderResponse.builder()
                .externalOrderId(request.getExternalOrderId())
                .medpayOrderId(orderResponse.id())
                .medpayOrderNo(orderResponse.orderNo())
                .status(orderResponse.status())
                .totalAmount(orderResponse.totalAmount())
                .insuranceAmount(orderResponse.insuranceAmount())
                .selfPayAmount(orderResponse.selfPayAmount())
                .items(itemResponses)
                .createdAt(orderResponse.createdAt())
                .expireAt(orderResponse.expireAt())
                .build();
    }

    private OrderType parseOrderType(String type) {
        if (type == null) return OrderType.MEDICINE;
        try {
            return OrderType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return OrderType.MEDICINE;
        }
    }
}
