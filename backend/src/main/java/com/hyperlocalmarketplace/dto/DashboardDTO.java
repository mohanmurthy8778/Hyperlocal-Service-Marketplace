package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private List<BookingResponseDTO> upcomingBookings;
    private List<BookingResponseDTO> completedBookings;
    private List<BookingResponseDTO> cancelledBookings;
    private List<FavoriteDTO> favoriteProviders;
    private List<ReviewDTO> recentReviews;
    private List<NotificationDTO> notifications;
    private Long totalBookings;

    // Provider Specific Fields
    private Double todayEarnings;
    private Double weeklyEarnings;
    private Double monthlyEarnings;
    private Double totalEarnings;
    private Integer completedJobs;
    private Double pendingPayments;
    private Double averageRating;
    private Integer totalCustomers;
}

