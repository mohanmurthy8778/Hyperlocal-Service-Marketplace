package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.AdminBroadcastRequest;
import com.hyperlocalmarketplace.dto.AdminSendNotificationRequest;
import com.hyperlocalmarketplace.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Notification Controller", description = "Endpoints for administrators to dispatch custom alerts and broadcast messages platform-wide")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminNotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/send")
    @Operation(summary = "Admin: Send a targeted notification to a specific user")
    public ResponseEntity<Map<String, String>> sendNotification(
            @Valid @RequestBody AdminSendNotificationRequest request) {
        
        notificationService.sendNotificationToUser(
                request.getUserId(),
                request.getTitle(),
                request.getMessage(),
                request.getType(),
                request.getPriority()
        );

        Map<String, String> response = new HashMap<>();
        response.put("message", "Custom notification successfully sent to user #" + request.getUserId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/broadcast")
    @Operation(summary = "Admin: Broadcast a notification to all registered marketplace users")
    public ResponseEntity<Map<String, String>> broadcastNotification(
            @Valid @RequestBody AdminBroadcastRequest request) {
        
        notificationService.broadcastNotification(
                request.getTitle(),
                request.getMessage(),
                request.getType(),
                request.getPriority()
        );

        Map<String, String> response = new HashMap<>();
        response.put("message", "Broadcast notification queued and sent successfully to all users");
        return ResponseEntity.ok(response);
    }
}
