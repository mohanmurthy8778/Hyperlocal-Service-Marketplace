package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLPricePredictionRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Provider rating is required")
    private Double providerRating;

    @NotNull(message = "Demand index is required")
    private Double demandIndex;

    @NotNull(message = "Distance is required")
    private Double distanceKm;

    private Integer isWeekend;
}
