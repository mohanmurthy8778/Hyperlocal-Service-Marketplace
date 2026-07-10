package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLRecommendResponse {
    
    private Long customerId;
    private List<RecommendationItem> recommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendationItem {
        private String serviceName;
        private String provider;
        private Double rating;
        private Double distance;
        private Double recommendationScore;
    }
}
