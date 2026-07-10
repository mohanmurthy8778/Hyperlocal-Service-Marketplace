package com.hyperlocalmarketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateRequest {
    private Long bookingId;
    private Long providerId;
    private Double latitude;
    private Double longitude;
}
