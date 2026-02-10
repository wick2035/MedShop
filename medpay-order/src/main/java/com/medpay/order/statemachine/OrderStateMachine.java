package com.medpay.order.statemachine;

import com.medpay.common.constant.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class OrderStateMachine {

    private static final Map<OrderStatus, Map<OrderEvent, OrderStatus>> TRANSITIONS;

    static {
        TRANSITIONS = new EnumMap<>(OrderStatus.class);

        // CREATED transitions
        Map<OrderEvent, OrderStatus> created = new EnumMap<>(OrderEvent.class);
        created.put(OrderEvent.SUBMIT_PAYMENT, OrderStatus.PENDING_PAYMENT);
        created.put(OrderEvent.CANCEL, OrderStatus.CANCELLED);
        TRANSITIONS.put(OrderStatus.CREATED, created);

        // PENDING_PAYMENT transitions
        Map<OrderEvent, OrderStatus> pendingPayment = new EnumMap<>(OrderEvent.class);
        pendingPayment.put(OrderEvent.BEGIN_PAYING, OrderStatus.PAYING);
        pendingPayment.put(OrderEvent.CANCEL, OrderStatus.CANCELLED);
        pendingPayment.put(OrderEvent.PAYMENT_EXPIRED, OrderStatus.CANCELLED);
        TRANSITIONS.put(OrderStatus.PENDING_PAYMENT, pendingPayment);

        // PAYING transitions
        Map<OrderEvent, OrderStatus> paying = new EnumMap<>(OrderEvent.class);
        paying.put(OrderEvent.PAYMENT_SUCCESS, OrderStatus.PAID);
        paying.put(OrderEvent.PAYMENT_FAILED, OrderStatus.PENDING_PAYMENT);
        paying.put(OrderEvent.PAYMENT_EXPIRED, OrderStatus.CANCELLED);
        TRANSITIONS.put(OrderStatus.PAYING, paying);

        // PAID transitions
        Map<OrderEvent, OrderStatus> paid = new EnumMap<>(OrderEvent.class);
        paid.put(OrderEvent.BEGIN_PROCESSING, OrderStatus.PROCESSING);
        paid.put(OrderEvent.REQUEST_REFUND, OrderStatus.REFUND_REQUESTED);
        paid.put(OrderEvent.CANCEL, OrderStatus.CANCELLED);
        TRANSITIONS.put(OrderStatus.PAID, paid);

        // PROCESSING transitions
        Map<OrderEvent, OrderStatus> processing = new EnumMap<>(OrderEvent.class);
        processing.put(OrderEvent.COMPLETE, OrderStatus.COMPLETED);
        TRANSITIONS.put(OrderStatus.PROCESSING, processing);

        // COMPLETED transitions
        Map<OrderEvent, OrderStatus> completed = new EnumMap<>(OrderEvent.class);
        completed.put(OrderEvent.CLOSE, OrderStatus.CLOSED);
        completed.put(OrderEvent.REQUEST_REFUND, OrderStatus.REFUND_REQUESTED);
        TRANSITIONS.put(OrderStatus.COMPLETED, completed);

        // REFUND_REQUESTED transitions
        Map<OrderEvent, OrderStatus> refundRequested = new EnumMap<>(OrderEvent.class);
        refundRequested.put(OrderEvent.APPROVE_REFUND, OrderStatus.REFUND_APPROVED);
        refundRequested.put(OrderEvent.REJECT_REFUND, OrderStatus.PAID);
        TRANSITIONS.put(OrderStatus.REFUND_REQUESTED, refundRequested);

        // REFUND_APPROVED transitions
        Map<OrderEvent, OrderStatus> refundApproved = new EnumMap<>(OrderEvent.class);
        refundApproved.put(OrderEvent.REFUND_SUCCESS, OrderStatus.REFUNDED);
        refundApproved.put(OrderEvent.REFUND_FAILED, OrderStatus.PAID);
        TRANSITIONS.put(OrderStatus.REFUND_APPROVED, refundApproved);

        // REFUNDED transitions
        Map<OrderEvent, OrderStatus> refunded = new EnumMap<>(OrderEvent.class);
        refunded.put(OrderEvent.CLOSE, OrderStatus.CLOSED);
        TRANSITIONS.put(OrderStatus.REFUNDED, refunded);

        // PARTIALLY_REFUNDED transitions
        Map<OrderEvent, OrderStatus> partiallyRefunded = new EnumMap<>(OrderEvent.class);
        partiallyRefunded.put(OrderEvent.REQUEST_REFUND, OrderStatus.PARTIAL_REFUND_REQUESTED);
        TRANSITIONS.put(OrderStatus.PARTIALLY_REFUNDED, partiallyRefunded);

        // PARTIAL_REFUND_REQUESTED transitions
        Map<OrderEvent, OrderStatus> partialRefundRequested = new EnumMap<>(OrderEvent.class);
        partialRefundRequested.put(OrderEvent.APPROVE_REFUND, OrderStatus.PARTIAL_REFUND_APPROVED);
        partialRefundRequested.put(OrderEvent.REJECT_REFUND, OrderStatus.PARTIALLY_REFUNDED);
        TRANSITIONS.put(OrderStatus.PARTIAL_REFUND_REQUESTED, partialRefundRequested);

        // PARTIAL_REFUND_APPROVED transitions
        Map<OrderEvent, OrderStatus> partialRefundApproved = new EnumMap<>(OrderEvent.class);
        partialRefundApproved.put(OrderEvent.REFUND_SUCCESS, OrderStatus.PARTIALLY_REFUNDED);
        partialRefundApproved.put(OrderEvent.REFUND_FAILED, OrderStatus.PARTIALLY_REFUNDED);
        TRANSITIONS.put(OrderStatus.PARTIAL_REFUND_APPROVED, partialRefundApproved);
    }

    /**
     * Perform a state transition. Throws IllegalStateTransitionException if the transition is not allowed.
     *
     * @param current the current order status
     * @param event   the event to apply
     * @return the new order status after transition
     */
    public OrderStatus transition(OrderStatus current, OrderEvent event) {
        Map<OrderEvent, OrderStatus> eventMap = TRANSITIONS.get(current);
        if (eventMap == null) {
            throw new IllegalStateTransitionException(current, event);
        }
        OrderStatus next = eventMap.get(event);
        if (next == null) {
            throw new IllegalStateTransitionException(current, event);
        }
        return next;
    }

    /**
     * Check whether a transition is allowed without throwing an exception.
     *
     * @param current the current order status
     * @param event   the event to check
     * @return true if the transition is allowed, false otherwise
     */
    public boolean canTransition(OrderStatus current, OrderEvent event) {
        Map<OrderEvent, OrderStatus> eventMap = TRANSITIONS.get(current);
        if (eventMap == null) {
            return false;
        }
        return eventMap.containsKey(event);
    }
}
