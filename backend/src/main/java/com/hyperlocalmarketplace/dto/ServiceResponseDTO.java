package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceResponseDTO {
    private Long id;
    private String name;
    private String categoryName;
    private Long categoryId;
    private String description;
    private Double price;
    private String duration;
    private String imageUrl;
    
    // Provider Details
    private Long providerId;
    private String providerName;
    private String providerAvatar;
    private Double providerRating;
    private Integer providerCompletedJobs;
    private boolean providerVerified;
    
    // Rating & Review details
    private Double averageRating;
    private List<ReviewDTO> reviews;
}
