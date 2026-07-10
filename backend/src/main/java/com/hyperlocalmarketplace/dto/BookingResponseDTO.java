package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {
    private Long id;
    private String bookingNumber;
    private Long customerId;
    private String customerName;
    private Long providerId;
    private String providerName;
    private Long serviceId;
    private String serviceName;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private String status;
    private String specialInstructions;
    private Double totalAmount;
    private String paymentStatus;
    private AddressDTO address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
