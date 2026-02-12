package com.medpay.common.security;

import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;

import java.util.UUID;

/**
 * 租户权限工具类：集中处理 hospitalId 解析与归属验证。
 * <p>
 * HOSPITAL_ADMIN 的 TenantContext 由 JWT 设置（不可伪造），
 * 因此 resolveHospitalId 会强制使用 TenantContext 值、忽略请求参数；
 * SUPER_ADMIN 的 TenantContext 可能为 null（未选医院时），此时使用请求参数。
 */
public final class TenantUtil {

    private TenantUtil() {
    }

    /**
     * 解析 hospitalId：如果当前有租户上下文（HOSPITAL_ADMIN），
     * 则强制返回租户上下文的 hospitalId，忽略请求参数。
     */
    public static UUID resolveHospitalId(UUID requestedHospitalId) {
        UUID tenantId = TenantContext.getCurrentHospitalId();
        if (tenantId != null) {
            return tenantId;
        }
        return requestedHospitalId;
    }

    /**
     * 验证资源归属：资源的 hospitalId 必须与当前租户匹配。
     * SUPER_ADMIN（tenantId 为 null）跳过检查。
     */
    public static void verifyAccess(UUID resourceHospitalId) {
        UUID tenantId = TenantContext.getCurrentHospitalId();
        if (tenantId != null && !tenantId.equals(resourceHospitalId)) {
            throw new BusinessException(ErrorCode.TENANT_ACCESS_DENIED);
        }
    }

    /**
     * 要求当前用户为超级管理员（TenantContext 无 hospitalId）。
     * HOSPITAL_ADMIN 的 JWT 中始终携带 hospitalId，因此 tenantId != null。
     */
    public static void requireSuperAdmin() {
        UUID tenantId = TenantContext.getCurrentHospitalId();
        if (tenantId != null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }
}
