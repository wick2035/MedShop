package com.medpay.payment.statemachine;

import com.medpay.common.constant.PaymentStatus;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class PaymentStateMachine {

    private final Map<PaymentStatus, Map<PaymentEvent, PaymentStatus>> transitions = new EnumMap<>(PaymentStatus.class);

    public PaymentStateMachine() {
        addTransition(PaymentStatus.PENDING, PaymentEvent.SUBMIT, PaymentStatus.PROCESSING);
        addTransition(PaymentStatus.PENDING, PaymentEvent.EXPIRED, PaymentStatus.EXPIRED);

        addTransition(PaymentStatus.PROCESSING, PaymentEvent.CHANNEL_SUCCESS, PaymentStatus.SUCCESS);
        addTransition(PaymentStatus.PROCESSING, PaymentEvent.CHANNEL_FAILED, PaymentStatus.FAILED);
        addTransition(PaymentStatus.PROCESSING, PaymentEvent.EXPIRED, PaymentStatus.EXPIRED);

        addTransition(PaymentStatus.SUCCESS, PaymentEvent.BEGIN_REFUND, PaymentStatus.REFUNDING);
        addTransition(PaymentStatus.SUCCESS, PaymentEvent.SETTLE, PaymentStatus.SETTLED);

        addTransition(PaymentStatus.REFUNDING, PaymentEvent.REFUND_SUCCESS, PaymentStatus.REFUNDED);
        addTransition(PaymentStatus.REFUNDING, PaymentEvent.REFUND_FAILED, PaymentStatus.SUCCESS);
    }

    private void addTransition(PaymentStatus from, PaymentEvent event, PaymentStatus to) {
        transitions.computeIfAbsent(from, k -> new EnumMap<>(PaymentEvent.class)).put(event, to);
    }

    public PaymentStatus transition(PaymentStatus currentStatus, PaymentEvent event) {
        Map<PaymentEvent, PaymentStatus> eventMap = transitions.get(currentStatus);
        if (eventMap == null || !eventMap.containsKey(event)) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID,
                    String.format("Invalid payment transition: %s + %s", currentStatus, event));
        }
        return eventMap.get(event);
    }
}
