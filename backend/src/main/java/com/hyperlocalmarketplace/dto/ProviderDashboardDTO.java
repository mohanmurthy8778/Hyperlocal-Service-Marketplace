package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderDashboardDTO {
    private Double todayEarnings;
    private Double totalEarnings;
    private Double averageRating;
    private Integer completedJobs;
    private Integer pendingBookingsCount;
    private Integer activeBookingsCount;
    private Integer totalCustomers;
    private List<BookingResponseDTO> recentBookings;
}
