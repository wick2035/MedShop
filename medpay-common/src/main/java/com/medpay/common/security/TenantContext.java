package com.medpay.common.security;

import java.util.UUID;

public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_HOSPITAL_ID = new ThreadLocal<>();

    private TenantContext() {
    }

    public static UUID getCurrentHospitalId() {
        return CURRENT_HOSPITAL_ID.get();
    }

    public static void setCurrentHospitalId(UUID hospitalId) {
        CURRENT_HOSPITAL_ID.set(hospitalId);
    }

    public static void clear() {
        CURRENT_HOSPITAL_ID.remove();
    }

    public static UUID requireCurrentHospitalId() {
        UUID id = CURRENT_HOSPITAL_ID.get();
        if (id == null) {
            throw new IllegalStateException("Tenant context not set. Are you in a request scope?");
        }
        return id;
    }
}
