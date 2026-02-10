package com.medpay.notification.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.notification.domain.Notification;
import com.medpay.notification.domain.NotificationRepository;
import com.medpay.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "通知", description = "用户通知管理")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @Operation(summary = "查询我的通知列表")
    @GetMapping
    public ApiResponse<Page<Notification>> listMyNotifications(
            @RequestParam(required = false) Boolean unreadOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {

        UUID userId = (UUID) authentication.getPrincipal();

        Page<Notification> page;
        if (Boolean.TRUE.equals(unreadOnly)) {
            page = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false, pageable);
        } else {
            page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        return ApiResponse.success(page);
    }

    @Operation(summary = "获取未读通知数量")
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        long count = notificationService.getUnreadCount(userId);
        return ApiResponse.success(count);
    }

    @Operation(summary = "标记单条通知为已读")
    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable UUID id, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        notificationService.markAsRead(id, userId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "标记全部通知为已读")
    @PutMapping("/read-all")
    public ApiResponse<Integer> markAllAsRead(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        int count = notificationService.markAllAsRead(userId);
        return ApiResponse.success(count);
    }
}
