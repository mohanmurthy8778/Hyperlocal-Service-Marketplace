package com.hyperlocalmarketplace.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLProviderRankingResponse {
    private Long providerId;
    private Double providerScore;
    private Integer rank;
    private String performanceGrade;
    private Boolean topProviderBadge;
}
