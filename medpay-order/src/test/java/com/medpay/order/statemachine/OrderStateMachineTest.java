package com.medpay.order.statemachine;

import com.medpay.common.constant.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderStateMachineTest {

    private OrderStateMachine machine;

    @BeforeEach
    void setUp() {
        machine = new OrderStateMachine();
    }

    @Test
    @DisplayName("Full happy path: CREATED -> PENDING_PAYMENT -> PAYING -> PAID -> PROCESSING -> COMPLETED -> CLOSED")
    void testFullHappyPath() {
        OrderStatus status = OrderStatus.CREATED;

        status = machine.transition(status, OrderEvent.SUBMIT_PAYMENT);
        assertEquals(OrderStatus.PENDING_PAYMENT, status);

        status = machine.transition(status, OrderEvent.BEGIN_PAYING);
        assertEquals(OrderStatus.PAYING, status);

        status = machine.transition(status, OrderEvent.PAYMENT_SUCCESS);
        assertEquals(OrderStatus.PAID, status);

        status = machine.transition(status, OrderEvent.BEGIN_PROCESSING);
        assertEquals(OrderStatus.PROCESSING, status);

        status = machine.transition(status, OrderEvent.COMPLETE);
        assertEquals(OrderStatus.COMPLETED, status);

        status = machine.transition(status, OrderEvent.CLOSE);
        assertEquals(OrderStatus.CLOSED, status);
    }

    @Test
    @DisplayName("Cancel from CREATED")
    void testCancelFromCreated() {
        OrderStatus status = machine.transition(OrderStatus.CREATED, OrderEvent.CANCEL);
        assertEquals(OrderStatus.CANCELLED, status);
    }

    @Test
    @DisplayName("Cancel from PENDING_PAYMENT")
    void testCancelFromPendingPayment() {
        OrderStatus status = machine.transition(OrderStatus.PENDING_PAYMENT, OrderEvent.CANCEL);
        assertEquals(OrderStatus.CANCELLED, status);
    }

    @Test
    @DisplayName("Payment expired from PENDING_PAYMENT")
    void testPaymentExpired() {
        OrderStatus status = machine.transition(OrderStatus.PENDING_PAYMENT, OrderEvent.PAYMENT_EXPIRED);
        assertEquals(OrderStatus.CANCELLED, status);
    }

    @Test
    @DisplayName("Payment failed recovers to PENDING_PAYMENT")
    void testPaymentFailed() {
        OrderStatus status = machine.transition(OrderStatus.PAYING, OrderEvent.PAYMENT_FAILED);
        assertEquals(OrderStatus.PENDING_PAYMENT, status);
    }

    @Test
    @DisplayName("Full refund flow: PAID -> REFUND_REQUESTED -> REFUND_APPROVED -> REFUNDED")
    void testRefundFlow() {
        OrderStatus status = OrderStatus.PAID;

        status = machine.transition(status, OrderEvent.REQUEST_REFUND);
        assertEquals(OrderStatus.REFUND_REQUESTED, status);

        status = machine.transition(status, OrderEvent.APPROVE_REFUND);
        assertEquals(OrderStatus.REFUND_APPROVED, status);

        status = machine.transition(status, OrderEvent.REFUND_SUCCESS);
        assertEquals(OrderStatus.REFUNDED, status);
    }

    @Test
    @DisplayName("Refund rejected returns to PAID")
    void testRefundRejected() {
        OrderStatus status = machine.transition(OrderStatus.REFUND_REQUESTED, OrderEvent.REJECT_REFUND);
        assertEquals(OrderStatus.PAID, status);
    }

    @Test
    @DisplayName("Cannot transition from CANCELLED")
    void testCannotTransitionFromCancelled() {
        assertThrows(IllegalStateTransitionException.class,
                () -> machine.transition(OrderStatus.CANCELLED, OrderEvent.SUBMIT_PAYMENT));
    }

    @Test
    @DisplayName("Cannot transition from CLOSED")
    void testCannotTransitionFromClosed() {
        assertThrows(IllegalStateTransitionException.class,
                () -> machine.transition(OrderStatus.CLOSED, OrderEvent.SUBMIT_PAYMENT));
        assertThrows(IllegalStateTransitionException.class,
                () -> machine.transition(OrderStatus.CLOSED, OrderEvent.CANCEL));
        assertThrows(IllegalStateTransitionException.class,
                () -> machine.transition(OrderStatus.CLOSED, OrderEvent.REQUEST_REFUND));
    }

    @Test
    @DisplayName("Cannot pay an already paid order")
    void testCannotPayAlreadyPaid() {
        assertThrows(IllegalStateTransitionException.class,
                () -> machine.transition(OrderStatus.PAID, OrderEvent.PAYMENT_SUCCESS));
    }

    @Test
    @DisplayName("canTransition returns correct boolean values")
    void testCanTransitionMethod() {
        assertTrue(machine.canTransition(OrderStatus.CREATED, OrderEvent.SUBMIT_PAYMENT));
        assertTrue(machine.canTransition(OrderStatus.CREATED, OrderEvent.CANCEL));
        assertFalse(machine.canTransition(OrderStatus.CREATED, OrderEvent.PAYMENT_SUCCESS));

        assertTrue(machine.canTransition(OrderStatus.PAYING, OrderEvent.PAYMENT_SUCCESS));
        assertFalse(machine.canTransition(OrderStatus.PAYING, OrderEvent.SUBMIT_PAYMENT));

        assertTrue(machine.canTransition(OrderStatus.PAID, OrderEvent.BEGIN_PROCESSING));
        assertTrue(machine.canTransition(OrderStatus.PAID, OrderEvent.REQUEST_REFUND));
        assertFalse(machine.canTransition(OrderStatus.PAID, OrderEvent.COMPLETE));

        assertFalse(machine.canTransition(OrderStatus.CANCELLED, OrderEvent.CANCEL));
        assertFalse(machine.canTransition(OrderStatus.CLOSED, OrderEvent.CLOSE));
    }

    @Test
    @DisplayName("Partial refund flow")
    void testPartialRefundFlow() {
        OrderStatus status = OrderStatus.PARTIALLY_REFUNDED;

        status = machine.transition(status, OrderEvent.REQUEST_REFUND);
        assertEquals(OrderStatus.PARTIAL_REFUND_REQUESTED, status);

        status = machine.transition(status, OrderEvent.APPROVE_REFUND);
        assertEquals(OrderStatus.PARTIAL_REFUND_APPROVED, status);

        status = machine.transition(status, OrderEvent.REFUND_SUCCESS);
        assertEquals(OrderStatus.PARTIALLY_REFUNDED, status);
    }

    @Test
    @DisplayName("Partial refund rejection returns to PARTIALLY_REFUNDED")
    void testPartialRefundRejected() {
        OrderStatus status = machine.transition(OrderStatus.PARTIAL_REFUND_REQUESTED, OrderEvent.REJECT_REFUND);
        assertEquals(OrderStatus.PARTIALLY_REFUNDED, status);
    }

    @Test
    @DisplayName("Refund failed from REFUND_APPROVED returns to PAID")
    void testRefundFailed() {
        OrderStatus status = machine.transition(OrderStatus.REFUND_APPROVED, OrderEvent.REFUND_FAILED);
        assertEquals(OrderStatus.PAID, status);
    }

    @Test
    @DisplayName("Payment expired from PAYING")
    void testPaymentExpiredFromPaying() {
        OrderStatus status = machine.transition(OrderStatus.PAYING, OrderEvent.PAYMENT_EXPIRED);
        assertEquals(OrderStatus.CANCELLED, status);
    }

    @Test
    @DisplayName("Refund from COMPLETED")
    void testRefundFromCompleted() {
        OrderStatus status = machine.transition(OrderStatus.COMPLETED, OrderEvent.REQUEST_REFUND);
        assertEquals(OrderStatus.REFUND_REQUESTED, status);
    }

    @Test
    @DisplayName("REFUNDED can be closed")
    void testRefundedCanBeClosed() {
        OrderStatus status = machine.transition(OrderStatus.REFUNDED, OrderEvent.CLOSE);
        assertEquals(OrderStatus.CLOSED, status);
    }
}
