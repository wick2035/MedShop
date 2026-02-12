package com.medpay.order.service;

import com.medpay.catalog.domain.DoctorSchedule;
import com.medpay.catalog.domain.MedicalService;
import com.medpay.catalog.domain.Product;
import com.medpay.catalog.service.DoctorScheduleService;
import com.medpay.catalog.service.MedicalServiceService;
import com.medpay.catalog.service.ProductService;
import com.medpay.common.constant.OrderStatus;
import com.medpay.common.constant.OrderType;
import com.medpay.common.event.EventOutboxService;
import com.medpay.common.event.OrderCancelledEvent;
import com.medpay.common.event.OrderCreatedEvent;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantContext;
import com.medpay.common.security.TenantUtil;
import com.medpay.common.util.SnowflakeIdGenerator;
import com.medpay.order.domain.ItemType;
import com.medpay.order.domain.Order;
import com.medpay.order.domain.OrderItem;
import com.medpay.order.dto.*;
import com.medpay.order.repository.OrderRepository;
import com.medpay.order.statemachine.OrderEvent;
import com.medpay.order.statemachine.OrderStateMachine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderStateMachine stateMachine;
    private final SnowflakeIdGenerator idGenerator;
    private final ProductService productService;
    private final MedicalServiceService medicalServiceService;
    private final DoctorScheduleService doctorScheduleService;
    private final EventOutboxService eventOutboxService;
    private final AppointmentService appointmentService;
    private final com.medpay.catalog.service.PrescriptionService prescriptionService;

    private static final int ORDER_EXPIRE_MINUTES = 30;

    // ==================== 创建订单 ====================

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, UUID patientId) {
        UUID hospitalId = TenantContext.requireCurrentHospitalId();

        // 1. Build order
        Order order = new Order();
        order.setHospitalId(hospitalId);
        order.setPatientId(patientId);
        order.setOrderNo(idGenerator.generateOrderNo());
        order.setOrderType(request.orderType().name());
        order.setStatus(OrderStatus.CREATED.name());
        order.setExpireAt(LocalDateTime.now().plusMinutes(ORDER_EXPIRE_MINUTES));
        order.setRemark(request.remark());

        // 2. Process appointment info
        if (request.appointmentInfo() != null) {
            AppointmentInfo apptInfo = request.appointmentInfo();
            DoctorSchedule schedule = doctorScheduleService.findByIdOrThrow(apptInfo.scheduleId());
            order.setScheduleId(schedule.getId());
            order.setDoctorId(schedule.getDoctorId());
            order.setAppointmentDate(apptInfo.appointmentDate());
            order.setAppointmentTimeStart(schedule.getTimeSlotStart());
            order.setAppointmentTimeEnd(schedule.getTimeSlotEnd());
            // Book the slot atomically
            doctorScheduleService.bookSlot(schedule.getId());
        }

        // 3. Process delivery info
        if (request.deliveryInfo() != null) {
            DeliveryInfo deliveryInfo = request.deliveryInfo();
            order.setDeliveryType(deliveryInfo.type());
            order.setDeliveryAddress(deliveryInfo.address());
        }

        // 4. Build order items with price snapshots
        List<OrderItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalInsurance = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            OrderItem item = buildOrderItem(itemReq);
            items.add(item);
            totalAmount = totalAmount.add(item.getSubtotal());
            totalInsurance = totalInsurance.add(item.getInsuranceAmount());
        }

        // 5. Set amounts
        order.setTotalAmount(totalAmount);
        order.setInsuranceAmount(totalInsurance);
        order.setSelfPayAmount(totalAmount.subtract(totalInsurance));
        order.setDiscountAmount(BigDecimal.ZERO);

        // 6. Save order first, then associate items
        Order savedOrder = orderRepository.save(order);
        for (OrderItem item : items) {
            item.setOrder(savedOrder);
        }
        savedOrder.setItems(items);
        savedOrder = orderRepository.save(savedOrder);

        // 7. Publish domain event
        OrderCreatedEvent event = new OrderCreatedEvent(
                savedOrder.getId(),
                savedOrder.getOrderNo(),
                patientId,
                hospitalId,
                savedOrder.getOrderType(),
                savedOrder.getTotalAmount()
        );
        eventOutboxService.saveEvent(event);

        log.info("Order created: orderNo={}, type={}, amount={}",
                savedOrder.getOrderNo(), savedOrder.getOrderType(), savedOrder.getTotalAmount());

        return toResponse(savedOrder);
    }

    // ==================== 处方转订单 ====================

    @Transactional
    public OrderResponse createPrescriptionOrder(UUID prescriptionId, UUID patientId) {
        com.medpay.catalog.domain.Prescription prescription = prescriptionService.findByIdOrThrow(prescriptionId);

        if (!"CONFIRMED".equals(prescription.getStatus())) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "只有已确认的处方才能转为订单");
        }

        // Set TenantContext from prescription if needed
        if (TenantContext.getCurrentHospitalId() == null && prescription.getHospitalId() != null) {
            TenantContext.setCurrentHospitalId(prescription.getHospitalId());
        }

        List<com.medpay.catalog.domain.PrescriptionItem> prescriptionItems =
                prescriptionService.findItemsByPrescriptionId(prescriptionId);

        // Build order item requests from prescription items
        List<OrderItemRequest> itemRequests = prescriptionItems.stream()
                .map(pi -> new OrderItemRequest(ItemType.PRODUCT, pi.getProductId(), pi.getQuantity()))
                .toList();

        OrderCreateRequest createReq = new OrderCreateRequest(
                OrderType.MEDICINE,
                itemRequests,
                null,
                null,
                null,
                "处方转订单: " + prescription.getPrescriptionNo()
        );

        OrderResponse response = createOrder(createReq, patientId);

        // Mark prescription as FILLED
        prescriptionService.markAsFilled(prescriptionId);

        log.info("Prescription {} converted to order {}", prescription.getPrescriptionNo(), response.orderNo());
        return response;
    }

    // ==================== 快捷挂号 ====================

    @Transactional
    public OrderResponse createAppointmentOrder(AppointmentOrderRequest request, UUID patientId) {
        DoctorSchedule schedule = doctorScheduleService.findByIdOrThrow(request.scheduleId());

        // Ensure TenantContext is set (patient JWT may not carry hospitalId)
        if (TenantContext.getCurrentHospitalId() == null && schedule.getHospitalId() != null) {
            TenantContext.setCurrentHospitalId(schedule.getHospitalId());
        }

        // Validate that the schedule has an associated medical service
        if (schedule.getServiceId() == null) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "该排班未关联医疗服务，无法创建挂号订单");
        }

        // Find the service associated with this schedule
        MedicalService registrationService = medicalServiceService.findByIdOrThrow(schedule.getServiceId());

        // Build order create request
        OrderItemRequest itemReq = new OrderItemRequest(ItemType.SERVICE, registrationService.getId(), 1);
        AppointmentInfo apptInfo = new AppointmentInfo(schedule.getId(), schedule.getScheduleDate());

        OrderCreateRequest createReq = new OrderCreateRequest(
                OrderType.REGISTRATION,
                List.of(itemReq),
                apptInfo,
                null,
                null,
                null
        );

        return createOrder(createReq, patientId);
    }

    // ==================== 取消订单 ====================

    @Transactional
    public void cancelOrder(UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // Validate state transition via state machine
        OrderStatus current = OrderStatus.valueOf(order.getStatus());
        OrderStatus next = stateMachine.transition(current, OrderEvent.CANCEL);

        // Release stock for PRODUCT items
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (ItemType.PRODUCT.name().equals(item.getItemType())) {
                    productService.releaseStock(item.getReferenceId(), item.getQuantity());
                }
            }
        }

        // Release schedule slot if booked
        if (order.getScheduleId() != null) {
            try {
                doctorScheduleService.releaseSlot(order.getScheduleId());
            } catch (Exception e) {
                log.warn("Failed to release schedule slot: scheduleId={}, error={}",
                        order.getScheduleId(), e.getMessage());
            }
        }

        // Update order
        order.setStatus(next.name());
        order.setCancelReason(reason);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        // Publish cancel event
        OrderCancelledEvent cancelledEvent = new OrderCancelledEvent(
                order.getId(), order.getOrderNo(), reason);
        eventOutboxService.saveEvent(cancelledEvent);

        log.info("Order cancelled: orderNo={}, reason={}", order.getOrderNo(), reason);
    }

    // ==================== 更新订单状态(供支付模块调用) ====================

    @Transactional
    public void updateOrderStatus(UUID orderId, OrderEvent event) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        TenantUtil.verifyAccess(order.getHospitalId());

        OrderStatus current = OrderStatus.valueOf(order.getStatus());
        OrderStatus next = stateMachine.transition(current, event);

        order.setStatus(next.name());

        // Set timestamps based on event
        switch (event) {
            case PAYMENT_SUCCESS -> {
                order.setPaidAt(LocalDateTime.now());
                // Create appointment record for registration orders
                if (OrderType.REGISTRATION.name().equals(order.getOrderType())) {
                    appointmentService.createAppointment(order);
                    log.info("Appointment created for order: orderNo={}", order.getOrderNo());
                }
            }
            case COMPLETE -> order.setCompletedAt(LocalDateTime.now());
            case CANCEL, PAYMENT_EXPIRED -> order.setCancelledAt(LocalDateTime.now());
            default -> { }
        }

        orderRepository.save(order);
        log.info("Order status updated: orderNo={}, {} -> {} (event={})",
                order.getOrderNo(), current, next, event);
    }

    // ==================== 查询 ====================

    @Transactional(readOnly = true)
    public Order findOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(UUID orderId) {
        Order order = findOrderById(orderId);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listOrders(UUID patientId, Pageable pageable) {
        Page<Order> page = orderRepository.findByPatientId(patientId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> adminListOrders(UUID hospitalId, OrderStatus status,
                                                OrderType type, Pageable pageable) {
        Page<Order> page;
        String statusStr = status != null ? status.name() : null;
        String typeStr = type != null ? type.name() : null;

        if (statusStr != null && typeStr != null) {
            page = orderRepository.findByHospitalIdAndStatusAndOrderType(
                    hospitalId, statusStr, typeStr, pageable);
        } else if (statusStr != null) {
            page = orderRepository.findByHospitalIdAndStatus(hospitalId, statusStr, pageable);
        } else if (typeStr != null) {
            page = orderRepository.findByHospitalIdAndOrderType(hospitalId, typeStr, pageable);
        } else {
            page = orderRepository.findByHospitalId(hospitalId, pageable);
        }

        return page.map(this::toResponse);
    }

    // ==================== 保险金额更新 ====================

    @Transactional
    public void updateInsuranceAmounts(UUID orderId, BigDecimal insuranceAmount, BigDecimal selfPayAmount) {
        int updated = orderRepository.updateInsuranceAmounts(orderId, insuranceAmount, selfPayAmount);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.ORDER_NOT_FOUND);
        }
        log.info("Order insurance amounts updated: orderId={}, insurance={}, selfPay={}",
                orderId, insuranceAmount, selfPayAmount);
    }

    // ==================== 内部方法 ====================

    private OrderItem buildOrderItem(OrderItemRequest itemReq) {
        OrderItem item = new OrderItem();
        item.setItemType(itemReq.itemType().name());
        item.setReferenceId(itemReq.referenceId());
        item.setQuantity(itemReq.quantity());

        if (itemReq.itemType() == ItemType.SERVICE) {
            MedicalService service = medicalServiceService.findByIdOrThrow(itemReq.referenceId());
            item.setName(service.getName());
            item.setUnitPrice(service.getPrice());
            item.setInsuranceCovered(service.getInsuranceCovered());
            item.setInsuranceRatio(service.getInsuranceRatio() != null
                    ? service.getInsuranceRatio() : BigDecimal.ZERO);
        } else if (itemReq.itemType() == ItemType.PRODUCT) {
            Product product = productService.findByIdOrThrow(itemReq.referenceId());
            item.setName(product.getName());
            item.setSpecification(product.getSpecification());
            item.setUnitPrice(product.getPrice());
            item.setInsuranceCovered(product.getInsuranceCovered());
            item.setInsuranceRatio(product.getInsuranceRatio() != null
                    ? product.getInsuranceRatio() : BigDecimal.ZERO);

            // Deduct stock atomically
            boolean deducted = productService.deductStock(product.getId(), itemReq.quantity());
            if (!deducted) {
                throw new BusinessException(ErrorCode.STOCK_INSUFFICIENT,
                        String.format("库存不足: %s", product.getName()));
            }
        }

        // Calculate subtotal and insurance
        BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        item.setSubtotal(subtotal);

        if (Boolean.TRUE.equals(item.getInsuranceCovered())) {
            BigDecimal insuranceAmt = subtotal.multiply(item.getInsuranceRatio())
                    .setScale(2, RoundingMode.HALF_UP);
            item.setInsuranceAmount(insuranceAmt);
            item.setSelfPayAmount(subtotal.subtract(insuranceAmt));
        } else {
            item.setInsuranceAmount(BigDecimal.ZERO);
            item.setSelfPayAmount(subtotal);
        }

        return item;
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(this::toItemResponse).toList()
                : List.of();

        return new OrderResponse(
                order.getId(),
                order.getOrderNo(),
                order.getPatientId(),
                order.getDoctorId(),
                order.getOrderType(),
                order.getOrderSource(),
                order.getTotalAmount(),
                order.getDiscountAmount(),
                order.getInsuranceAmount(),
                order.getSelfPayAmount(),
                order.getStatus(),
                itemResponses,
                order.getPaidAt(),
                order.getCompletedAt(),
                order.getCancelReason(),
                order.getExpireAt(),
                order.getAppointmentDate(),
                order.getAppointmentTimeStart(),
                order.getAppointmentTimeEnd(),
                order.getDeliveryType(),
                order.getDeliveryAddress(),
                order.getRemark(),
                order.getCreatedAt()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getItemType(),
                item.getReferenceId(),
                item.getName(),
                item.getSpecification(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal(),
                item.getInsuranceAmount(),
                item.getSelfPayAmount()
        );
    }
}
