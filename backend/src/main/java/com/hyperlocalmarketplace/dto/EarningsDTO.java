package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EarningsDTO {
    private Double todayEarnings;
    private Double weeklyEarnings;
    private Double monthlyEarnings;
    private Double totalEarnings;
    private Integer completedJobs;
    private Double pendingPayments;
    private Double averageRating;
    private Integer totalCustomers;
    private List<PaymentHistoryDTO> paymentHistory;
}
