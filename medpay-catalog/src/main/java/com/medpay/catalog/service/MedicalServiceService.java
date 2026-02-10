package com.medpay.catalog.service;

import com.medpay.catalog.domain.MedicalService;
import com.medpay.catalog.domain.ServiceType;
import com.medpay.catalog.dto.MedicalServiceRequest;
import com.medpay.catalog.dto.MedicalServiceResponse;
import com.medpay.catalog.repository.MedicalServiceRepository;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalServiceService {

    private final MedicalServiceRepository medicalServiceRepository;

    public MedicalServiceResponse create(MedicalServiceRequest request) {
        UUID hospitalId = TenantContext.requireCurrentHospitalId();

        MedicalService entity = new MedicalService();
        entity.setHospitalId(hospitalId);
        mapRequestToEntity(request, entity);

        entity = medicalServiceRepository.save(entity);
        return toResponse(entity);
    }

    public MedicalServiceResponse update(UUID id, MedicalServiceRequest request) {
        MedicalService entity = findByIdOrThrow(id);
        mapRequestToEntity(request, entity);

        entity = medicalServiceRepository.save(entity);
        return toResponse(entity);
    }

    public void delete(UUID id) {
        MedicalService entity = findByIdOrThrow(id);
        entity.setStatus("INACTIVE");
        medicalServiceRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public Page<MedicalServiceResponse> search(UUID hospitalIdParam, String keyword, ServiceType type, UUID deptId, Pageable pageable) {
        UUID hospitalId = hospitalIdParam != null ? hospitalIdParam : TenantContext.getCurrentHospitalId();
        if (hospitalId == null) {
            return Page.empty(pageable);
        }
        Page<MedicalService> page = medicalServiceRepository.search(hospitalId, keyword, type, deptId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public MedicalServiceResponse getById(UUID id) {
        MedicalService entity = findByIdOrThrow(id);
        return toResponse(entity);
    }

    public MedicalService findByIdOrThrow(UUID id) {
        return medicalServiceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));
    }

    public MedicalService findRegistrationService(UUID serviceId) {
        MedicalService service = findByIdOrThrow(serviceId);
        if (service.getServiceType() != ServiceType.REGISTRATION) {
            throw new BusinessException(ErrorCode.SERVICE_NOT_FOUND, "该服务不是挂号类型");
        }
        return service;
    }

    private void mapRequestToEntity(MedicalServiceRequest request, MedicalService entity) {
        entity.setCategoryId(request.categoryId());
        entity.setDepartmentId(request.departmentId());
        entity.setName(request.name());
        entity.setCode(request.code());
        entity.setServiceType(request.serviceType());
        entity.setDescription(request.description());
        entity.setPrice(request.price());
        entity.setOriginalPrice(request.originalPrice());
        entity.setInsuranceCovered(request.insuranceCovered());
        entity.setInsuranceCategory(request.insuranceCategory());
        entity.setInsuranceRatio(request.insuranceRatio());
        entity.setMaxDailyQuota(request.maxDailyQuota());
        entity.setDurationMinutes(request.durationMinutes());
        entity.setRequiresPrescription(request.requiresPrescription());
        entity.setImageUrls(request.imageUrls());
        entity.setTags(request.tags());
        entity.setSortOrder(request.sortOrder());
    }

    private MedicalServiceResponse toResponse(MedicalService entity) {
        return new MedicalServiceResponse(
                entity.getId(),
                entity.getHospitalId(),
                entity.getCategoryId(),
                entity.getDepartmentId(),
                entity.getName(),
                entity.getCode(),
                entity.getServiceType(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getOriginalPrice(),
                entity.getInsuranceCovered(),
                entity.getInsuranceCategory(),
                entity.getInsuranceRatio(),
                entity.getMaxDailyQuota(),
                entity.getDurationMinutes(),
                entity.getRequiresPrescription(),
                entity.getImageUrls(),
                entity.getTags(),
                entity.getSortOrder(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
