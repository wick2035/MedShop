package com.medpay.user.domain;

import com.medpay.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient")
@Getter
@Setter
@NoArgsConstructor
public class Patient extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "id_card_number_enc")
    private String idCardNumberEnc;

    @Column(name = "id_card_number_hash")
    private String idCardNumberHash;

    @Column(name = "blood_type")
    private String bloodType;

    @Column(name = "allergy_info")
    private String allergyInfo;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "emergency_phone")
    private String emergencyPhone;

    @Column(name = "medical_card_number")
    private String medicalCardNumber;

    @Column(name = "insurance_type")
    private String insuranceType;

    @Column(name = "insurance_number_enc")
    private String insuranceNumberEnc;

    @Column(name = "default_hospital_id")
    private UUID defaultHospitalId;
}
