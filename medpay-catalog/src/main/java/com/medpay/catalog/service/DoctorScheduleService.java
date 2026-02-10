package com.medpay.catalog.service;

import com.medpay.catalog.domain.DoctorSchedule;
import com.medpay.catalog.dto.DoctorScheduleRequest;
import com.medpay.catalog.dto.DoctorScheduleResponse;
import com.medpay.catalog.repository.DoctorScheduleRepository;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;

    public DoctorSchedule findByIdOrThrow(UUID id) {
        return doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "排班不存在"));
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
            Page<DoctorSchedule> page = doctorScheduleRepository.findByDoctorIdAndStatus(doctorId, "AVAILABLE", pageable);
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
        mapRequestToEntity(request, schedule);

        schedule = doctorScheduleRepository.save(schedule);
        return toResponse(schedule);
    }

    public void cancelSchedule(UUID id) {
        DoctorSchedule schedule = findByIdOrThrow(id);
        schedule.setStatus("CANCELLED");
        doctorScheduleRepository.save(schedule);
    }

    private void mapRequestToEntity(DoctorScheduleRequest request, DoctorSchedule entity) {
        entity.setDoctorId(request.doctorId());
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
