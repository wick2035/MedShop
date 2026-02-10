package com.medpay.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "hospitalId", type = UUID.class))
@Filter(name = "tenantFilter", condition = "hospital_id = :hospitalId")
public abstract class TenantEntity extends BaseEntity {

    @Column(name = "hospital_id", nullable = false, columnDefinition = "uuid")
    private UUID hospitalId;
}
