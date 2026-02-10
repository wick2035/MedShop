package com.medpay.order.statemachine;

import com.medpay.common.constant.OrderStatus;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;

public class IllegalStateTransitionException extends BusinessException {

    public IllegalStateTransitionException(OrderStatus from, OrderEvent event) {
        super(ErrorCode.ORDER_STATUS_INVALID,
                String.format("不允许的状态转换: 当前状态 [%s], 事件 [%s]", from, event));
    }
}
