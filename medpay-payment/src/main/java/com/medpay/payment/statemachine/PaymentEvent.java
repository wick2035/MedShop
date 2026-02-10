package com.medpay.payment.statemachine;

public enum PaymentEvent {
    SUBMIT,
    CHANNEL_SUCCESS,
    CHANNEL_FAILED,
    EXPIRED,
    BEGIN_REFUND,
    REFUND_SUCCESS,
    REFUND_FAILED,
    SETTLE
}
