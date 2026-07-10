package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.DeviceTokenRequest;
import com.hyperlocalmarketplace.dto.NotificationResponse;
import com.hyperlocalmarketplace.service.NotificationService;
import com.hyperlocalmarketplace.service.PushNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Controller", description = "Endpoints for user alerts, read states, and push device token management")
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PushNotificationService pushNotificationService;

    @GetMapping
    @Operation(summary = "Get paginated list of notifications for the authenticated user")
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<NotificationResponse> notifications = notificationService.getNotificationsPaginated(
                principal.getName(), page, size);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a specific notification alert")
    public ResponseEntity<NotificationResponse> getNotificationById(Principal principal, @PathVariable Long id) {
        // Find in full paginated list or check access directly
        Page<NotificationResponse> page = notificationService.getNotificationsPaginated(principal.getName(), 0, 1000);
        NotificationResponse matching = page.getContent().stream()
                .filter(n -> n.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new com.hyperlocalmarketplace.exception.ResourceNotFoundException(
                        "Notification not found or unauthorized"));
        
        return ResponseEntity.ok(matching);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get total unread notifications count for the authenticated user")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        long count = notificationService.getUnreadCount(principal.getName());
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read/{id}")
    @Operation(summary = "Mark a specific notification alert as read")
    public ResponseEntity<Map<String, String>> markRead(Principal principal, @PathVariable Long id) {
        notificationService.markAsRead(id, principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications for the authenticated user as read")
    public ResponseEntity<Map<String, String>> markAllRead(Principal principal) {
        notificationService.markAllNotificationsAsRead(principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a specific notification alert")
    public ResponseEntity<Map<String, String>> deleteNotification(Principal principal, @PathVariable Long id) {
        notificationService.deleteNotificationForUser(id, principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear-all")
    @Operation(summary = "Clear all notifications for the authenticated user")
    public ResponseEntity<Map<String, String>> clearAll(Principal principal) {
        notificationService.clearAllNotifications(principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications cleared successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-device")
    @Operation(summary = "Register FCM registration token for push notifications")
    public ResponseEntity<Map<String, String>> registerDevice(
            Principal principal,
            @Valid @RequestBody DeviceTokenRequest request) {
        
        pushNotificationService.registerToken(principal.getName(), request.getToken());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Device registered successfully for push notifications");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remove-device")
    @Operation(summary = "Remove FCM registration token to stop push notifications on this device")
    public ResponseEntity<Map<String, String>> removeDevice(
            Principal principal,
            @Valid @RequestBody DeviceTokenRequest request) {
        
        pushNotificationService.removeToken(principal.getName(), request.getToken());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Device unregistered successfully");
        return ResponseEntity.ok(response);
    }
}
