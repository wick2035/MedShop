package com.medpay.user.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "doctor")
@Getter
@Setter
@NoArgsConstructor
public class Doctor extends TenantEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String title;

    private String specialty;

    @Column(name = "license_number")
    private String licenseNumber;

    private String bio;

    @Column(name = "consultation_fee")
    private BigDecimal consultationFee;

    @Column(name = "is_accepting_patients")
    private Boolean isAcceptingPatients = true;

    @Column(name = "rating_score")
    private BigDecimal ratingScore = BigDecimal.ZERO;

    @Column(name = "total_ratings")
    private Integer totalRatings = 0;

    @Column(nullable = false)
    private String status = "ACTIVE";
}
