package com.medpay.hospital.service;

import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.hospital.domain.Hospital;
import com.medpay.hospital.domain.HospitalStatus;
import com.medpay.hospital.domain.SubscriptionTier;
import com.medpay.hospital.dto.HospitalCreateRequest;
import com.medpay.hospital.dto.HospitalResponse;
import com.medpay.hospital.dto.HospitalUpdateRequest;
import com.medpay.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * 医院业务逻辑层
 */
@Service
@RequiredArgsConstructor
@Transactional
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    /**
     * 创建医院
     */
    public HospitalResponse createHospital(HospitalCreateRequest request) {
        if (hospitalRepository.existsByCode(request.code())) {
            throw new BusinessException(ErrorCode.DUPLICATE_ENTRY, "医院编码已存在: " + request.code());
        }

        Hospital hospital = new Hospital();
        hospital.setName(request.name());
        hospital.setCode(request.code());
        hospital.setLicenseNumber(request.licenseNumber());
        hospital.setAddress(request.address());
        hospital.setCity(request.city());
        hospital.setProvince(request.province());
        hospital.setContactPhone(request.contactPhone());
        hospital.setContactEmail(request.contactEmail());
        hospital.setLogoUrl(request.logoUrl());
        hospital.setTimezone(request.timezone());
        hospital.setStatus(HospitalStatus.ACTIVE.name());
        hospital.setSubscriptionTier(SubscriptionTier.STANDARD.name());

        hospital = hospitalRepository.save(hospital);
        return toResponse(hospital);
    }

    /**
     * 更新医院基本信息（仅更新非 null 字段）
     */
    public HospitalResponse updateHospital(UUID id, HospitalUpdateRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.HOSPITAL_NOT_FOUND));

        if (request.name() != null) {
            hospital.setName(request.name());
        }
        if (request.licenseNumber() != null) {
            hospital.setLicenseNumber(request.licenseNumber());
        }
        if (request.address() != null) {
            hospital.setAddress(request.address());
        }
        if (request.city() != null) {
            hospital.setCity(request.city());
        }
        if (request.province() != null) {
            hospital.setProvince(request.province());
        }
        if (request.contactPhone() != null) {
            hospital.setContactPhone(request.contactPhone());
        }
        if (request.contactEmail() != null) {
            hospital.setContactEmail(request.contactEmail());
        }
        if (request.logoUrl() != null) {
            hospital.setLogoUrl(request.logoUrl());
        }
        if (request.timezone() != null) {
            hospital.setTimezone(request.timezone());
        }

        hospital = hospitalRepository.save(hospital);
        return toResponse(hospital);
    }

    /**
     * 更新医院状态
     */
    public void updateStatus(UUID id, HospitalStatus status) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.HOSPITAL_NOT_FOUND));

        hospital.setStatus(status.name());
        hospitalRepository.save(hospital);
    }

    /**
     * 更新医院扩展配置
     */
    public void updateConfig(UUID id, Map<String, Object> configJson) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.HOSPITAL_NOT_FOUND));

        hospital.setConfigJson(configJson.toString());
        hospitalRepository.save(hospital);
    }

    /**
     * 根据 ID 查询医院详情
     */
    @Transactional(readOnly = true)
    public HospitalResponse getById(UUID id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.HOSPITAL_NOT_FOUND));

        return toResponse(hospital);
    }

    /**
     * 分页查询医院列表
     */
    @Transactional(readOnly = true)
    public Page<HospitalResponse> list(Pageable pageable) {
        return hospitalRepository.findAll(pageable)
                .map(this::toResponse);
    }

    /**
     * 实体转响应 DTO
     */
    private HospitalResponse toResponse(Hospital hospital) {
        return new HospitalResponse(
                hospital.getId(),
                hospital.getName(),
                hospital.getCode(),
                hospital.getLicenseNumber(),
                hospital.getAddress(),
                hospital.getCity(),
                hospital.getProvince(),
                hospital.getContactPhone(),
                hospital.getContactEmail(),
                hospital.getLogoUrl(),
                hospital.getStatus(),
                hospital.getSubscriptionTier(),
                hospital.getConfigJson(),
                hospital.getTimezone(),
                hospital.getCreatedAt(),
                hospital.getUpdatedAt()
        );
    }
}
