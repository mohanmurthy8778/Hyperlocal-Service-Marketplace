package com.hyperlocalmarketplace.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueDTO {
    private Double totalRevenue;
    private Double totalCommission;
    private Double platformFee;
    private Double providerEarnings;
}
