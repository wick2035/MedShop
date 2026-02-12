package com.medpay.open.service;

import com.medpay.common.constant.EntityType;
import com.medpay.common.security.TenantContext;
import com.medpay.open.domain.ExternalEntityMapping;
import com.medpay.open.repository.ExternalEntityMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalMappingService {

    private final ExternalEntityMappingRepository mappingRepository;

    @Transactional(readOnly = true)
    public Optional<UUID> findMedpayId(String clientId, EntityType entityType, String externalId) {
        return mappingRepository.findByClientIdAndEntityTypeAndExternalId(
                clientId, entityType.name(), externalId
        ).map(ExternalEntityMapping::getMedpayId);
    }

    @Transactional(readOnly = true)
    public Optional<String> findExternalId(UUID medpayId) {
        return mappingRepository.findByMedpayId(medpayId)
                .map(ExternalEntityMapping::getExternalId);
    }

    @Transactional
    public ExternalEntityMapping createMapping(String clientId, EntityType entityType,
                                                String externalId, UUID medpayId) {
        ExternalEntityMapping mapping = new ExternalEntityMapping();
        mapping.setClientId(clientId);
        mapping.setEntityType(entityType.name());
        mapping.setExternalId(externalId);
        mapping.setMedpayId(medpayId);
        mapping.setHospitalId(TenantContext.requireCurrentHospitalId());

        mapping = mappingRepository.save(mapping);
        log.info("Created entity mapping: clientId={}, type={}, extId={} -> medpayId={}",
                clientId, entityType, externalId, medpayId);
        return mapping;
    }

    @Transactional
    public UUID getOrCreateMapping(String clientId, EntityType entityType,
                                    String externalId, UUID medpayId) {
        return findMedpayId(clientId, entityType, externalId)
                .orElseGet(() -> {
                    createMapping(clientId, entityType, externalId, medpayId);
                    return medpayId;
                });
    }
}
