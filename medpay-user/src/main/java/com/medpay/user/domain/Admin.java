package com.medpay.user.domain;

import com.medpay.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "admin")
@Getter
@Setter
@NoArgsConstructor
public class Admin extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "admin_level", nullable = false)
    private String adminLevel;

    @Column(name = "permissions_json", columnDefinition = "jsonb")
    private String permissionsJson = "[]";
}
