package com.medpay.user.dto;

import com.medpay.common.constant.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserInfoResponse {

    private UUID id;
    private String username;
    private String phone;
    private String email;
    private UserRole role;
    private String status;
    private String avatarUrl;
    private String fullName;
    private UUID hospitalId;
    private UUID doctorId;
}
