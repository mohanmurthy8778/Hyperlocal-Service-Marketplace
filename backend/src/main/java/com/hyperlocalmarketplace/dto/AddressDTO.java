package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDTO {

    private Long id;

    @NotBlank(message = "House number is required")
    private String houseNumber;

    @NotBlank(message = "Street is required")
    private String street;

    private String area;

    @NotBlank(message = "City is required")
    private String city;

    private String district;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[0-9a-zA-Z\\s-]{3,10}$", message = "Postal code must be between 3 and 10 alphanumeric characters")
    private String postalCode;

    private Double latitude;

    private Double longitude;

    private boolean isDefault;
}
