package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSendNotificationRequest {

    @NotNull(message = "Target user ID is required")
    private Long userId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String type; // e.g. "SYSTEM", "PROMOTION"

    private String priority; // e.g. "LOW", "MEDIUM", "HIGH", "URGENT"
}
