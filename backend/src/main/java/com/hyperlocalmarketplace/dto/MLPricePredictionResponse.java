package com.hyperlocalmarketplace.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLPricePredictionResponse {
    private Double predictedPrice;
    private Double suggestedDiscount;
    private Double confidenceScore;
}
