package com.medpay.common.security;

import java.util.Set;

public final class ApiClientContext {

    private static final ThreadLocal<ApiClientInfo> CURRENT = new ThreadLocal<>();

    private ApiClientContext() {}

    public static void set(ApiClientInfo info) {
        CURRENT.set(info);
    }

    public static ApiClientInfo get() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }

    public static String requireClientId() {
        ApiClientInfo info = CURRENT.get();
        if (info == null) {
            throw new IllegalStateException("ApiClient context not set");
        }
        return info.clientId();
    }

    public record ApiClientInfo(
            String clientId,
            String clientName,
            Set<String> permissions,
            String callbackUrl,
            String callbackSecret
    ) {}
}
