package com.hyperlocalmarketplace.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLFraudCheckResponse {
    private Double fraudScore;
    private String riskLevel;
    private String recommendation;
}
