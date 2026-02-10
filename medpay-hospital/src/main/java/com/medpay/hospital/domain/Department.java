package com.medpay.hospital.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * 科室实体 — 属于某个医院（租户），继承 TenantEntity 自动携带 hospitalId 与租户过滤器
 */
@Entity
@Table(
        name = "department",
        uniqueConstraints = @UniqueConstraint(columnNames = {"hospital_id", "code"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Department extends TenantEntity {

    /**
     * 科室名称
     */
    @Column(nullable = false)
    private String name;

    /**
     * 科室编码（同一医院内唯一）
     */
    @Column(nullable = false)
    private String code;

    /**
     * 上级科室 ID，为 null 表示顶级科室
     */
    @Column(name = "parent_id")
    private UUID parentId;

    /**
     * 科室描述
     */
    private String description;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 状态：ACTIVE / INACTIVE
     */
    @Column(nullable = false)
    private String status = "ACTIVE";
}
