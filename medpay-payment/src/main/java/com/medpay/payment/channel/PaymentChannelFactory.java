package com.medpay.payment.channel;

import com.medpay.common.constant.PaymentChannelEnum;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class PaymentChannelFactory {

    private final Map<PaymentChannelEnum, PaymentChannel> channelMap;

    public PaymentChannelFactory(List<PaymentChannel> channels) {
        this.channelMap = channels.stream()
                .collect(Collectors.toMap(PaymentChannel::getChannelCode, Function.identity()));
    }

    public PaymentChannel getChannel(PaymentChannelEnum channelCode) {
        PaymentChannel channel = channelMap.get(channelCode);
        if (channel == null) {
            throw new BusinessException(ErrorCode.PAYMENT_CHANNEL_NOT_FOUND);
        }
        return channel;
    }
}
