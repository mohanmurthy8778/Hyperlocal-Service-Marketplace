package com.hyperlocalmarketplace.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteDTO {
    private Long id;
    private Long customerId;
    private Long providerId;
    private String providerName;
    private String providerAvatar;
    private Double providerRating;
    private String providerCategory;
}
