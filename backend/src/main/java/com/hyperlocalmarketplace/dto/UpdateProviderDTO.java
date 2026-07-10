package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProviderDTO {
    private String firstName;
    private String lastName;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
    private String phone;

    private String avatar;
    private String bio;
    private String experience;
    private List<String> skills;
    private List<String> languages;
    private String workingHours;
    private List<String> availableDays;
    private String location;
}
