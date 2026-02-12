package com.medpay.order.service;

import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantUtil;
import com.medpay.common.util.SnowflakeIdGenerator;
import com.medpay.order.domain.Appointment;
import com.medpay.order.domain.AppointmentStatus;
import com.medpay.order.domain.Order;
import com.medpay.order.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SnowflakeIdGenerator idGenerator;

    /**
     * Create an appointment from a paid order.
     */
    public Appointment createAppointment(Order order) {
        Appointment appointment = new Appointment();
        appointment.setAppointmentNo(idGenerator.generateAppointmentNo());
        appointment.setHospitalId(order.getHospitalId());
        appointment.setPatientId(order.getPatientId());
        appointment.setDoctorId(order.getDoctorId());
        appointment.setScheduleId(order.getScheduleId());
        appointment.setOrderId(order.getId());
        appointment.setAppointmentDate(order.getAppointmentDate());
        appointment.setTimeSlotStart(order.getAppointmentTimeStart());
        appointment.setTimeSlotEnd(order.getAppointmentTimeEnd());

        int maxQueue = appointmentRepository.findMaxQueueNumber(
                order.getDoctorId(), order.getAppointmentDate());
        appointment.setQueueNumber(maxQueue + 1);

        appointment.setStatus(AppointmentStatus.BOOKED);

        appointment = appointmentRepository.save(appointment);
        return appointment;
    }

    /**
     * List appointments for a doctor on a given date.
     */
    @Transactional(readOnly = true)
    public List<Appointment> listByDoctor(UUID doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDateOrderByQueueNumber(doctorId, date);
    }

    /**
     * Get a single appointment by ID.
     */
    @Transactional(readOnly = true)
    public Appointment getById(UUID appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "预约不存在"));
    }

    /**
     * Check in a patient for their appointment.
     */
    public void checkIn(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "预约不存在"));
        TenantUtil.verifyAccess(appointment.getHospitalId());

        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "当前预约状态不允许签到");
        }

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointment.setCheckInTime(LocalDateTime.now());
        appointmentRepository.save(appointment);
    }

    /**
     * Start consultation for a checked-in appointment.
     */
    public void startConsultation(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "预约不存在"));
        TenantUtil.verifyAccess(appointment.getHospitalId());

        if (appointment.getStatus() != AppointmentStatus.CHECKED_IN) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "当前预约状态不允许开始就诊");
        }

        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        appointmentRepository.save(appointment);
    }

    /**
     * Complete an in-progress appointment.
     */
    public void complete(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "预约不存在"));
        TenantUtil.verifyAccess(appointment.getHospitalId());

        if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "当前预约状态不允许完成");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
    }
}
