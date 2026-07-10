package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLFraudCheckRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Cancellations count is required")
    private Integer cancellations;

    @NotNull(message = "Refund requests count is required")
    private Integer refundRequests;

    @NotNull(message = "Payment failures count is required")
    private Integer paymentFailures;

    @NotNull(message = "Fake reviews flag is required")
    private Integer fakeReviewsFlag;
}
