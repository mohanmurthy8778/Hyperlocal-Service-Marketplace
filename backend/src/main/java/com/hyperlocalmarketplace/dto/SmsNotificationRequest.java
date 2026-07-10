package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmsNotificationRequest {

    @NotBlank(message = "Recipient phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Message content is required")
    private String message;
}
