package com.medpay.catalog.service;

import com.medpay.catalog.domain.DoctorSchedule;
import com.medpay.catalog.dto.DoctorScheduleRequest;
import com.medpay.catalog.dto.DoctorScheduleResponse;
import com.medpay.catalog.repository.DoctorScheduleRepository;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantContext;
import com.medpay.common.security.TenantUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DoctorSchedule findByIdOrThrow(UUID id) {
        return doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "排班不存在"));
    }

    @Transactional(readOnly = true)
    public DoctorScheduleResponse getScheduleById(UUID id) {
        return toResponse(findByIdOrThrow(id));
    }

    public void bookSlot(UUID scheduleId) {
        int updated = doctorScheduleRepository.bookSlot(scheduleId);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.SCHEDULE_FULL);
        }
    }

    public void releaseSlot(UUID scheduleId) {
        doctorScheduleRepository.releaseSlot(scheduleId);
    }

    @Transactional(readOnly = true)
    public Page<DoctorScheduleResponse> findAvailable(UUID doctorId, LocalDate date, Pageable pageable) {
        if (doctorId != null) {
            UUID resolvedId = resolveDoctorEntityId(doctorId);
            Page<DoctorSchedule> page;
            if (date != null) {
                page = doctorScheduleRepository.findByDoctorIdAndStatusAndScheduleDate(
                        resolvedId, "AVAILABLE", date, pageable);
            } else {
                page = doctorScheduleRepository.findByDoctorIdAndStatus(
                        resolvedId, "AVAILABLE", pageable);
            }
            return page.map(this::toResponse);
        }
        UUID hospitalId = TenantContext.getCurrentHospitalId();
        if (hospitalId == null || date == null) {
            return Page.empty(pageable);
        }
        Page<DoctorSchedule> page = doctorScheduleRepository.findAvailable(hospitalId, date, pageable);
        return page.map(this::toResponse);
    }

    public DoctorScheduleResponse createSchedule(DoctorScheduleRequest request) {
        UUID hospitalId = TenantContext.requireCurrentHospitalId();

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setHospitalId(hospitalId);
        mapRequestToEntity(request, schedule);
        schedule.setBookedCount(0);
        schedule.setStatus("AVAILABLE");

        schedule = doctorScheduleRepository.save(schedule);
        return toResponse(schedule);
    }

    public DoctorScheduleResponse updateSchedule(UUID id, DoctorScheduleRequest request) {
        DoctorSchedule schedule = findByIdOrThrow(id);
        TenantUtil.verifyAccess(schedule.getHospitalId());
        mapRequestToEntity(request, schedule);

        schedule = doctorScheduleRepository.save(schedule);
        return toResponse(schedule);
    }

    public void cancelSchedule(UUID id) {
        DoctorSchedule schedule = findByIdOrThrow(id);
        TenantUtil.verifyAccess(schedule.getHospitalId());
        schedule.setStatus("CANCELLED");
        doctorScheduleRepository.save(schedule);
    }

    /**
     * Resolves a doctor entity ID from a value that may be either
     * the doctor table PK or a user_account ID.
     */
    private UUID resolveDoctorEntityId(UUID idOrUserId) {
        // Check if it is already a doctor entity ID
        Long count = (Long) entityManager.createNativeQuery(
                        "SELECT COUNT(*) FROM doctor WHERE id = :id")
                .setParameter("id", idOrUserId)
                .getSingleResult();
        if (count > 0) return idOrUserId;

        // Try as a user_account ID
        @SuppressWarnings("unchecked")
        List<UUID> result = entityManager.createNativeQuery(
                        "SELECT id FROM doctor WHERE user_id = :uid")
                .setParameter("uid", idOrUserId)
                .getResultList();
        if (!result.isEmpty()) return result.get(0);

        throw new BusinessException(ErrorCode.NOT_FOUND, "医生不存在");
    }

    private void mapRequestToEntity(DoctorScheduleRequest request, DoctorSchedule entity) {
        entity.setDoctorId(resolveDoctorEntityId(request.doctorId()));
        entity.setServiceId(request.serviceId());
        entity.setScheduleDate(request.scheduleDate());
        entity.setTimeSlotStart(request.timeSlotStart());
        entity.setTimeSlotEnd(request.timeSlotEnd());
        entity.setMaxPatients(request.maxPatients());
    }

    private DoctorScheduleResponse toResponse(DoctorSchedule entity) {
        return new DoctorScheduleResponse(
                entity.getId(),
                entity.getDoctorId(),
                entity.getServiceId(),
                entity.getScheduleDate(),
                entity.getTimeSlotStart(),
                entity.getTimeSlotEnd(),
                entity.getMaxPatients(),
                entity.getBookedCount(),
                entity.getStatus(),
                entity.getCreatedAt()
        );
    }
}
