package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    private LocalDate dob;
    private String avatar;
    private String emergencyPhone;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String preferredLanguage;
    private String bio;
}
