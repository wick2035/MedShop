package com.medpay.open.service;

import com.medpay.catalog.domain.Product;
import com.medpay.catalog.domain.ProductType;
import com.medpay.catalog.repository.ProductRepository;
import com.medpay.common.constant.EntityType;
import com.medpay.common.constant.UserRole;
import com.medpay.common.security.TenantContext;
import com.medpay.open.dto.OpenItemData;
import com.medpay.user.domain.Patient;
import com.medpay.user.domain.UserAccount;
import com.medpay.user.repository.PatientRepository;
import com.medpay.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShadowEntityService {

    private final ExternalMappingService mappingService;
    private final ProductRepository productRepository;
    private final UserAccountRepository userAccountRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UUID ensureProductExists(String clientId, OpenItemData itemData) {
        // Check existing mapping
        return mappingService.findMedpayId(clientId, EntityType.PRODUCT, itemData.getExternalProductId())
                .map(medpayId -> {
                    // Update price if changed
                    productRepository.findById(medpayId).ifPresent(product -> {
                        boolean changed = false;
                        if (product.getPrice().compareTo(itemData.getPrice()) != 0) {
                            product.setPrice(itemData.getPrice());
                            changed = true;
                        }
                        if (itemData.getName() != null && !itemData.getName().equals(product.getName())) {
                            product.setName(itemData.getName());
                            changed = true;
                        }
                        if (changed) {
                            productRepository.save(product);
                            log.info("Updated shadow product: medpayId={}, extId={}",
                                    medpayId, itemData.getExternalProductId());
                        }
                    });
                    return medpayId;
                })
                .orElseGet(() -> createShadowProduct(clientId, itemData));
    }

    private UUID createShadowProduct(String clientId, OpenItemData itemData) {
        UUID hospitalId = TenantContext.requireCurrentHospitalId();

        Product product = new Product();
        product.setHospitalId(hospitalId);
        product.setName(itemData.getName());
        product.setCode(itemData.getCode() != null ? itemData.getCode() : "EXT-" + clientId + "-" + itemData.getExternalProductId());
        product.setProductType(parseProductType(itemData.getProductType()));
        product.setSpecification(itemData.getSpecification());
        product.setUnit(itemData.getUnit() != null ? itemData.getUnit() : "个");
        product.setPrice(itemData.getPrice());
        product.setStockQuantity(Integer.MAX_VALUE);
        product.setInsuranceCovered(itemData.isInsuranceCovered());
        product.setInsuranceCategory(itemData.getInsuranceCategory());
        product.setInsuranceRatio(itemData.getInsuranceRatio() != null
                ? itemData.getInsuranceRatio() : BigDecimal.ZERO);
        product.setStatus("ACTIVE");

        product = productRepository.save(product);

        mappingService.createMapping(clientId, EntityType.PRODUCT,
                itemData.getExternalProductId(), product.getId());

        log.info("Created shadow product: name={}, extId={} -> medpayId={}",
                product.getName(), itemData.getExternalProductId(), product.getId());
        return product.getId();
    }

    @Transactional
    public UUID ensurePatientExists(String clientId, String externalPatientId,
                                     String name, String gender, String insuranceType) {
        return mappingService.findMedpayId(clientId, EntityType.PATIENT, externalPatientId)
                .orElseGet(() -> createShadowPatient(clientId, externalPatientId,
                        name, gender, insuranceType));
    }

    private UUID createShadowPatient(String clientId, String externalPatientId,
                                      String name, String gender, String insuranceType) {
        // Create UserAccount
        String username = "ext_" + clientId + "_" + externalPatientId;
        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode("ext-shadow-nologin"));
        user.setRole(UserRole.PATIENT);
        user.setStatus("ACTIVE");
        user = userAccountRepository.save(user);

        // Create Patient
        Patient patient = new Patient();
        patient.setUserId(user.getId());
        patient.setFullName(name);
        patient.setGender(gender);
        patient.setInsuranceType(insuranceType);
        patient.setDefaultHospitalId(TenantContext.requireCurrentHospitalId());
        patient = patientRepository.save(patient);

        mappingService.createMapping(clientId, EntityType.PATIENT,
                externalPatientId, patient.getId());

        log.info("Created shadow patient: name={}, extId={} -> patientId={}",
                name, externalPatientId, patient.getId());
        return patient.getId();
    }

    private ProductType parseProductType(String type) {
        if (type == null) return ProductType.MEDICINE;
        try {
            return ProductType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ProductType.MEDICINE;
        }
    }
}
