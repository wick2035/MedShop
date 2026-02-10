package com.medpay.user.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.user.domain.UserAccount;
import com.medpay.user.dto.UserInfoResponse;
import com.medpay.user.repository.AdminRepository;
import com.medpay.user.repository.DoctorRepository;
import com.medpay.user.repository.PatientRepository;
import com.medpay.user.repository.UserAccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "用户", description = "当前用户信息")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserAccountRepository userAccountRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/me")
    public ApiResponse<UserInfoResponse> getCurrentUser(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        UserAccount account = userAccountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String fullName = switch (account.getRole()) {
            case PATIENT -> patientRepository.findByUserId(userId)
                    .map(p -> p.getFullName()).orElse(account.getUsername());
            case DOCTOR -> doctorRepository.findByUserId(userId)
                    .map(d -> d.getFullName()).orElse(account.getUsername());
            case HOSPITAL_ADMIN, SUPER_ADMIN -> adminRepository.findByUserId(userId)
                    .map(a -> a.getFullName()).orElse(account.getUsername());
        };

        UUID hospitalId = switch (account.getRole()) {
            case DOCTOR -> doctorRepository.findByUserId(userId)
                    .map(d -> d.getHospitalId()).orElse(null);
            case HOSPITAL_ADMIN -> adminRepository.findByUserId(userId)
                    .map(a -> a.getHospitalId()).orElse(null);
            default -> null;
        };

        UserInfoResponse info = UserInfoResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .phone(account.getPhone())
                .email(account.getEmail())
                .role(account.getRole())
                .status(account.getStatus())
                .avatarUrl(account.getAvatarUrl())
                .fullName(fullName)
                .hospitalId(hospitalId)
                .build();

        return ApiResponse.success(info);
    }
}
