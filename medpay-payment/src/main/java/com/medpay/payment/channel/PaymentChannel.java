package com.medpay.payment.channel;

import com.medpay.common.constant.PaymentChannelEnum;

public interface PaymentChannel {
    PaymentChannelEnum getChannelCode();
    PrepayResult prepay(PrepayRequest request);
    PaymentQueryResult queryPayment(String channelTransactionId);
    RefundResult refund(RefundRequest request);
    boolean verifyCallback(String body, String signature);
    PaymentCallbackData parseCallback(String body);
}
