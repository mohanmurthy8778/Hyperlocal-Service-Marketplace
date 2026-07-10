package com.hyperlocalmarketplace.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileDTO {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profileImage;
    private String gender;
    private LocalDate dob;
    private String emergencyPhone;
    private String bio;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String preferredLanguage;
    private List<AddressDTO> addresses;
    private LocalDateTime createdAt;
}
