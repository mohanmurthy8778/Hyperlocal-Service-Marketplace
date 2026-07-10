package com.hyperlocalmarketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "providers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String phone;

    private String gender;

    private LocalDate dob;

    private String avatar;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "provider_languages", joinColumns = @JoinColumn(name = "provider_id"))
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    private String experience;

    private String category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "provider_skills", joinColumns = @JoinColumn(name = "provider_id"))
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    private String workingHourStart;

    private String workingHourEnd;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "provider_available_days", joinColumns = @JoinColumn(name = "provider_id"))
    @Builder.Default
    private List<String> availableDays = new ArrayList<>();

    private String emergencyPhone;

    // Metrics
    private Double rating = 4.8;

    private Integer completedJobs = 0;

    private boolean isVerified = false;

    private LocalDate joinedDate = LocalDate.now();

    // Bank Details
    private String accountHolderName;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String upiId;

    // Social Links
    private String website;
    private String facebook;
    private String instagram;
    private String linkedin;

    // Notification Preferences
    private boolean emailNotifications = true;
    private boolean smsNotifications = true;
    private boolean pushNotifications = true;
    private boolean bookingAlerts = true;
    private boolean marketingEmails = false;
}
