package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLProviderRankingRequest {
    @NotNull(message = "Provider ID is required")
    private Long providerId;
}
