package com.medpay.open.repository;

import com.medpay.open.domain.ExternalEntityMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExternalEntityMappingRepository extends JpaRepository<ExternalEntityMapping, UUID> {

    Optional<ExternalEntityMapping> findByClientIdAndEntityTypeAndExternalId(
            String clientId, String entityType, String externalId);

    Optional<ExternalEntityMapping> findByMedpayId(UUID medpayId);
}
