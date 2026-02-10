package com.medpay.catalog.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "prescription")
public class Prescription extends TenantEntity {

    @Column(name = "prescription_no", unique = true, nullable = false)
    private String prescriptionNo;

    @Column(name = "doctor_id", nullable = false, columnDefinition = "uuid")
    private UUID doctorId;

    @Column(name = "patient_id", nullable = false, columnDefinition = "uuid")
    private UUID patientId;

    @Column(name = "appointment_id", columnDefinition = "uuid")
    private UUID appointmentId;

    @Column(name = "diagnosis")
    private String diagnosis;

    @Column(name = "diagnosis_code")
    private String diagnosisCode;

    @Column(name = "notes")
    private String notes;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "insurance_amount")
    private BigDecimal insuranceAmount;

    @Column(name = "self_pay_amount")
    private BigDecimal selfPayAmount;

    @Column(name = "status")
    private String status = "PENDING";

    @Column(name = "valid_until")
    private LocalDateTime validUntil;
}
