package com.medpay.catalog.service;

import com.medpay.catalog.domain.Prescription;
import com.medpay.catalog.domain.PrescriptionItem;
import com.medpay.catalog.domain.Product;
import com.medpay.catalog.dto.PrescriptionCreateRequest;
import com.medpay.catalog.dto.PrescriptionItemRequest;
import com.medpay.catalog.dto.PrescriptionResponse;
import com.medpay.catalog.dto.PrescriptionResponse.PrescriptionItemResponse;
import com.medpay.catalog.repository.PrescriptionItemRepository;
import com.medpay.catalog.repository.PrescriptionRepository;
import com.medpay.catalog.repository.ProductRepository;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantContext;
import com.medpay.common.util.SnowflakeIdGenerator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final ProductRepository productRepository;
    private final SnowflakeIdGenerator idGenerator;

    @PersistenceContext
    private EntityManager entityManager;

    public PrescriptionResponse createPrescription(UUID doctorIdOrUserId, PrescriptionCreateRequest request) {
        UUID doctorId = resolveDoctorEntityId(doctorIdOrUserId);
        String prescriptionNo = idGenerator.generatePrescriptionNo();

        List<PrescriptionItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal insuranceAmount = BigDecimal.ZERO;

        for (PrescriptionItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

            PrescriptionItem item = new PrescriptionItem();
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setSpecification(product.getSpecification());
            item.setUnitPrice(product.getPrice());
            item.setQuantity(itemReq.quantity());
            item.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));
            item.setDosageInstruction(itemReq.dosageInstruction());
            item.setFrequency(itemReq.frequency());
            item.setDurationDays(itemReq.durationDays());
            item.setInsuranceCovered(Boolean.TRUE.equals(product.getInsuranceCovered()));

            if (Boolean.TRUE.equals(product.getInsuranceCovered()) && product.getInsuranceRatio() != null) {
                item.setInsuranceRatio(product.getInsuranceRatio());
                BigDecimal itemInsurance = item.getSubtotal()
                        .multiply(product.getInsuranceRatio())
                        .setScale(2, RoundingMode.HALF_UP);
                insuranceAmount = insuranceAmount.add(itemInsurance);
            } else {
                item.setInsuranceRatio(BigDecimal.ZERO);
            }

            totalAmount = totalAmount.add(item.getSubtotal());
            items.add(item);
        }

        BigDecimal selfPayAmount = totalAmount.subtract(insuranceAmount);

        Prescription prescription = new Prescription();
        prescription.setHospitalId(TenantContext.requireCurrentHospitalId());
        prescription.setPrescriptionNo(prescriptionNo);
        prescription.setDoctorId(doctorId);
        prescription.setPatientId(request.patientId());
        prescription.setAppointmentId(request.appointmentId());
        prescription.setDiagnosis(request.diagnosis());
        prescription.setDiagnosisCode(request.diagnosisCode());
        prescription.setNotes(request.notes());
        prescription.setTotalAmount(totalAmount);
        prescription.setInsuranceAmount(insuranceAmount);
        prescription.setSelfPayAmount(selfPayAmount);
        prescription.setStatus("PENDING");
        prescription.setValidUntil(LocalDateTime.now().plusDays(7));

        Prescription saved = prescriptionRepository.save(prescription);

        for (PrescriptionItem item : items) {
            item.setPrescriptionId(saved.getId());
        }
        List<PrescriptionItem> savedItems = prescriptionItemRepository.saveAll(items);

        return toResponse(saved, savedItems);
    }

    public PrescriptionResponse confirmPrescription(UUID id) {
        Prescription prescription = findPrescriptionOrThrow(id);
        if (!"PENDING".equals(prescription.getStatus())) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "只有待确认的处方才能确认");
        }
        prescription.setStatus("CONFIRMED");
        Prescription saved = prescriptionRepository.save(prescription);
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(id);
        return toResponse(saved, items);
    }

    public PrescriptionResponse cancelPrescription(UUID id) {
        Prescription prescription = findPrescriptionOrThrow(id);
        if (!"PENDING".equals(prescription.getStatus()) && !"CONFIRMED".equals(prescription.getStatus())) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "当前处方状态不允许取消");
        }
        prescription.setStatus("CANCELLED");
        Prescription saved = prescriptionRepository.save(prescription);
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(id);
        return toResponse(saved, items);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getById(UUID id) {
        Prescription prescription = findPrescriptionOrThrow(id);
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(id);
        return toResponse(prescription, items);
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> listByPatient(UUID patientId, Pageable pageable) {
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable)
                .map(p -> {
                    List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(p.getId());
                    return toResponse(p, items);
                });
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> listByDoctor(UUID doctorIdOrUserId, Pageable pageable) {
        UUID doctorId = resolveDoctorEntityId(doctorIdOrUserId);
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId, pageable)
                .map(p -> {
                    List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(p.getId());
                    return toResponse(p, items);
                });
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getForOrderConversion(UUID prescriptionId) {
        Prescription prescription = findPrescriptionOrThrow(prescriptionId);
        if (!"CONFIRMED".equals(prescription.getStatus())) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "只有已确认的处方才能转为订单");
        }
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(prescriptionId);
        return toResponse(prescription, items);
    }

    private UUID resolveDoctorEntityId(UUID idOrUserId) {
        Long count = (Long) entityManager.createNativeQuery(
                        "SELECT COUNT(*) FROM doctor WHERE id = :id")
                .setParameter("id", idOrUserId)
                .getSingleResult();
        if (count > 0) return idOrUserId;

        @SuppressWarnings("unchecked")
        List<UUID> result = entityManager.createNativeQuery(
                        "SELECT id FROM doctor WHERE user_id = :uid")
                .setParameter("uid", idOrUserId)
                .getResultList();
        if (!result.isEmpty()) return result.get(0);

        throw new BusinessException(ErrorCode.NOT_FOUND, "医生不存在");
    }

    private Prescription findPrescriptionOrThrow(UUID id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "处方不存在"));
    }

    private PrescriptionResponse toResponse(Prescription p, List<PrescriptionItem> items) {
        List<PrescriptionItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .toList();

        return new PrescriptionResponse(
                p.getId(),
                p.getPrescriptionNo(),
                p.getDoctorId(),
                p.getPatientId(),
                p.getAppointmentId(),
                p.getDiagnosis(),
                p.getDiagnosisCode(),
                p.getNotes(),
                p.getTotalAmount(),
                p.getInsuranceAmount(),
                p.getSelfPayAmount(),
                p.getStatus(),
                p.getValidUntil(),
                p.getCreatedAt(),
                itemResponses
        );
    }

    private PrescriptionItemResponse toItemResponse(PrescriptionItem item) {
        return new PrescriptionItemResponse(
                item.getId(),
                item.getProductId(),
                item.getProductName(),
                item.getSpecification(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal(),
                item.getDosageInstruction(),
                item.getFrequency(),
                item.getDurationDays(),
                item.isInsuranceCovered(),
                item.getInsuranceRatio()
        );
    }
}
