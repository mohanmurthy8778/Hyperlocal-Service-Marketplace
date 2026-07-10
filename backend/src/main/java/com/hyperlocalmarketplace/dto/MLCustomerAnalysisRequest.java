package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLCustomerAnalysisRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;
}
