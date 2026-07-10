package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminBroadcastRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String type; // e.g. "SYSTEM", "PROMOTION"

    private String priority; // e.g. "LOW", "MEDIUM", "HIGH", "URGENT"
}
