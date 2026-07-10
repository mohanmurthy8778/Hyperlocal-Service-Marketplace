package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLCustomerAnalysisResponse {
    private String favoriteCategory;
    private String preferredBookingTime;
    private String budgetTier;
    private String segment;
    private List<String> recommendationTags;
}
