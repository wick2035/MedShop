package com.medpay.user.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.user.domain.Doctor;
import com.medpay.user.repository.DoctorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "医生", description = "医生信息查询")
@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorRepository doctorRepository;

    @Operation(summary = "医生列表（按医院筛选）")
    @GetMapping
    public ApiResponse<Page<Doctor>> listDoctors(
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID departmentId,
            Pageable pageable) {
        Page<Doctor> doctors;
        if (hospitalId != null && departmentId != null) {
            doctors = doctorRepository.findByHospitalIdAndDepartmentId(hospitalId, departmentId, pageable);
        } else if (hospitalId != null) {
            doctors = doctorRepository.findByHospitalId(hospitalId, pageable);
        } else {
            doctors = doctorRepository.findAll(pageable);
        }
        return ApiResponse.success(doctors);
    }

    @Operation(summary = "医生详情")
    @GetMapping("/{id}")
    public ApiResponse<Doctor> getDoctor(@PathVariable UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "医生不存在"));
        return ApiResponse.success(doctor);
    }
}
