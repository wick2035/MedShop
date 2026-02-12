package com.medpay.open.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "external_entity_mapping",
        uniqueConstraints = @UniqueConstraint(columnNames = {"client_id", "entity_type", "external_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ExternalEntityMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_id", nullable = false, length = 64)
    private String clientId;

    @Column(name = "entity_type", nullable = false, length = 30)
    private String entityType;

    @Column(name = "external_id", nullable = false, length = 100)
    private String externalId;

    @Column(name = "medpay_id", nullable = false)
    private UUID medpayId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
