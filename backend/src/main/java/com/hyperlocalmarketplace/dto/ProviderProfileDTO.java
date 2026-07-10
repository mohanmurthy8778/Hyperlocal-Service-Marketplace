package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderProfileDTO {
    private Long id;
    private String email;
    private String fullName;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatar;
    private String bio;
    private String experience;
    private List<String> skills;
    private String category;
    private List<String> languages;
    private String workingHours;
    private List<String> availableDays;
    private String location;
    private String verificationStatus; // e.g. "PENDING", "APPROVED", "REJECTED"
    private Double averageRating;
    private Integer totalReviews;
    private Integer completedJobs;
    private LocalDate memberSince;
}
