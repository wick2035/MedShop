package com.medpay.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // System errors 50xxx
    SYSTEM_ERROR(50000, "系统内部错误"),
    SERVICE_UNAVAILABLE(50003, "服务暂不可用"),

    // Parameter errors 40xxx
    PARAM_INVALID(40001, "参数校验失败"),
    PARAM_MISSING(40002, "缺少必要参数"),

    // Auth errors 401xx
    UNAUTHORIZED(40100, "未认证，请先登录"),
    TOKEN_EXPIRED(40101, "Token已过期"),
    TOKEN_INVALID(40102, "Token无效"),
    LOGIN_FAILED(40103, "用户名或密码错误"),
    ACCOUNT_LOCKED(40104, "账号已被锁定"),
    ACCOUNT_DISABLED(40105, "账号已被禁用"),

    // Permission errors 403xx
    FORBIDDEN(40300, "无权限执行此操作"),
    TENANT_ACCESS_DENIED(40301, "无权访问该医院数据"),

    // Not found 404xx
    NOT_FOUND(40400, "资源不存在"),
    USER_NOT_FOUND(40401, "用户不存在"),
    HOSPITAL_NOT_FOUND(40402, "医院不存在"),
    DEPARTMENT_NOT_FOUND(40403, "科室不存在"),
    SERVICE_NOT_FOUND(40404, "服务不存在"),
    PRODUCT_NOT_FOUND(40405, "产品不存在"),

    // Conflict 409xx
    DUPLICATE_ENTRY(40900, "数据已存在"),
    USERNAME_EXISTS(40901, "用户名已存在"),
    PHONE_EXISTS(40902, "手机号已注册"),
    EMAIL_EXISTS(40903, "邮箱已注册"),

    // Order errors 60xxx
    ORDER_NOT_FOUND(60001, "订单不存在"),
    ORDER_STATUS_INVALID(60002, "订单状态不允许此操作"),
    ORDER_EXPIRED(60003, "订单已过期"),
    ORDER_CANCEL_FAILED(60004, "订单取消失败"),

    // Payment errors 70xxx
    PAYMENT_DUPLICATE(70001, "重复支付"),
    PAYMENT_AMOUNT_MISMATCH(70002, "支付金额不匹配"),
    PAYMENT_CHANNEL_ERROR(70003, "支付渠道异常"),
    PAYMENT_CHANNEL_NOT_FOUND(70004, "支付渠道不存在"),
    PAYMENT_CALLBACK_INVALID(70005, "支付回调签名验证失败"),
    REFUND_EXCEED_LIMIT(70006, "退款金额超出限制"),
    REFUND_NOT_ALLOWED(70007, "当前状态不允许退款"),

    // Stock errors 80xxx
    STOCK_INSUFFICIENT(80001, "库存不足"),
    SCHEDULE_FULL(80002, "该时段已约满"),

    // Idempotency & concurrency 90xxx
    IDEMPOTENCY_KEY_MISSING(90001, "缺少幂等键"),
    IDEMPOTENCY_CONFLICT(90002, "请求正在处理中，请勿重复提交"),
    CONCURRENT_OPERATION(90003, "操作冲突，请稍后重试");

    private final int code;
    private final String message;
}
