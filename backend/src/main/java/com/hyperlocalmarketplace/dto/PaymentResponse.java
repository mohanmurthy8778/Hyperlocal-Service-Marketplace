package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String orderId;
    private String paymentId;
    private Double amount;
    private String status;
    private LocalDateTime createdAt;
}
