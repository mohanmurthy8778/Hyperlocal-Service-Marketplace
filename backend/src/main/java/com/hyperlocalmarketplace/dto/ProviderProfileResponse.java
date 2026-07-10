package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderProfileResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    private LocalDate dob;
    private String avatar;
    private String bio;
    private List<String> languages;
    private String experience;
    private String category;
    private List<String> skills;
    private String workingHourStart;
    private String workingHourEnd;
    private List<String> availableDays;
    private String emergencyPhone;
    private Double rating;
    private Integer completedJobs;
    private boolean isVerified;
    private LocalDate joinedDate;

    // Bank Account Info
    private String accountHolderName;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String upiId;

    // Social Info
    private String website;
    private String facebook;
    private String instagram;
    private String linkedin;

    // Notification Preferences
    private boolean emailNotifications;
    private boolean smsNotifications;
    private boolean pushNotifications;
    private boolean bookingAlerts;
    private boolean marketingEmails;
}
