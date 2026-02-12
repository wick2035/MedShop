package com.medpay.user.service;

import com.medpay.common.constant.UserRole;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.user.domain.Admin;
import com.medpay.user.domain.Doctor;
import com.medpay.user.domain.Patient;
import com.medpay.user.domain.UserAccount;
import com.medpay.user.dto.*;
import com.medpay.user.repository.AdminRepository;
import com.medpay.user.repository.DoctorRepository;
import com.medpay.user.repository.PatientRepository;
import com.medpay.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check duplicates
        if (userAccountRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }
        if (userAccountRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException(ErrorCode.PHONE_EXISTS);
        }

        // Create user account
        UserAccount account = new UserAccount();
        account.setUsername(request.getUsername());
        account.setPhone(request.getPhone());
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setRole(UserRole.PATIENT);
        account = userAccountRepository.save(account);

        // Create patient profile
        Patient patient = new Patient();
        patient.setUserId(account.getId());
        patient.setFullName(request.getFullName());
        patient.setGender(request.getGender());
        patientRepository.save(patient);

        log.info("New patient registered: username={}, id={}", account.getUsername(), account.getId());

        return buildLoginResponse(account);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Find by username or phone
        UserAccount account = userAccountRepository.findByUsername(request.getUsername())
                .or(() -> userAccountRepository.findByPhone(request.getUsername()))
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_FAILED));

        // Check locked
        if ("LOCKED".equals(account.getStatus())) {
            if (account.getLockedUntil() != null && account.getLockedUntil().isAfter(LocalDateTime.now())) {
                throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
            }
            // Auto-unlock if lock period expired
            account.setStatus("ACTIVE");
            account.setFailedLoginCount(0);
        }

        if ("DEACTIVATED".equals(account.getStatus())) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED);
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            account.setFailedLoginCount(account.getFailedLoginCount() + 1);
            if (account.getFailedLoginCount() >= 5) {
                account.setStatus("LOCKED");
                account.setLockedUntil(LocalDateTime.now().plusMinutes(30));
                log.warn("Account locked due to too many failed attempts: {}", account.getUsername());
            }
            userAccountRepository.save(account);
            throw new BusinessException(ErrorCode.LOGIN_FAILED);
        }

        // Login success
        account.setFailedLoginCount(0);
        account.setLastLoginAt(LocalDateTime.now());
        userAccountRepository.save(account);

        log.info("User logged in: username={}, role={}", account.getUsername(), account.getRole());

        return buildLoginResponse(account);
    }

    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }
        UUID userId = jwtService.extractUserId(refreshToken);
        UserAccount account = userAccountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return buildLoginResponse(account);
    }

    private LoginResponse buildLoginResponse(UserAccount account) {
        UUID hospitalId = resolveHospitalId(account);
        String accessToken = jwtService.generateAccessToken(account, hospitalId);
        String refreshToken = jwtService.generateRefreshToken(account, hospitalId);

        UserInfoResponse userInfo = buildUserInfo(account, hospitalId);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration() / 1000)
                .user(userInfo)
                .build();
    }

    private UUID resolveHospitalId(UserAccount account) {
        return switch (account.getRole()) {
            case DOCTOR -> doctorRepository.findByUserId(account.getId())
                    .map(Doctor::getHospitalId).orElse(null);
            case HOSPITAL_ADMIN -> adminRepository.findByUserId(account.getId())
                    .map(Admin::getHospitalId).orElse(null);
            case PATIENT -> patientRepository.findByUserId(account.getId())
                    .map(Patient::getDefaultHospitalId).orElse(null);
            case SUPER_ADMIN -> null;
        };
    }

    private UserInfoResponse buildUserInfo(UserAccount account, UUID hospitalId) {
        String fullName = resolveFullName(account);
        UUID doctorId = resolveDoctorEntityId(account);
        UUID patientId = resolvePatientEntityId(account);
        return UserInfoResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .phone(account.getPhone())
                .email(account.getEmail())
                .role(account.getRole())
                .status(account.getStatus())
                .avatarUrl(account.getAvatarUrl())
                .fullName(fullName)
                .hospitalId(hospitalId)
                .doctorId(doctorId)
                .patientId(patientId)
                .build();
    }

    private UUID resolveDoctorEntityId(UserAccount account) {
        if (account.getRole() != UserRole.DOCTOR) return null;
        return doctorRepository.findByUserId(account.getId())
                .map(Doctor::getId).orElse(null);
    }

    private UUID resolvePatientEntityId(UserAccount account) {
        if (account.getRole() != UserRole.PATIENT) return null;
        return patientRepository.findByUserId(account.getId())
                .map(Patient::getId).orElse(null);
    }

    private String resolveFullName(UserAccount account) {
        return switch (account.getRole()) {
            case PATIENT -> patientRepository.findByUserId(account.getId())
                    .map(Patient::getFullName).orElse(account.getUsername());
            case DOCTOR -> doctorRepository.findByUserId(account.getId())
                    .map(Doctor::getFullName).orElse(account.getUsername());
            case HOSPITAL_ADMIN, SUPER_ADMIN -> adminRepository.findByUserId(account.getId())
                    .map(Admin::getFullName).orElse(account.getUsername());
        };
    }
}
