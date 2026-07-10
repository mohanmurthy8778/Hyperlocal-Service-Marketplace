package com.hyperlocalmarketplace.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {
    private String invoiceNumber;
    private Long bookingId;
    private String customerName;
    private String providerName;
    private String serviceName;
    private String category;
    private String bookingDate;
    private String paymentDate;
    private Double amount;
    private Double gst;
    private Double total;
    private String paymentStatus;
}
