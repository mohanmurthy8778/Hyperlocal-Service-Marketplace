package com.hyperlocalmarketplace.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderDTO {
    private Long bookingId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String providerName;
    private String serviceName;
    private String address;
    private String bookingTime;
    private String timeRemainingLabel; // e.g., "24 hours", "2 hours", "30 minutes"
}
