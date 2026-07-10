package com.hyperlocalmarketplace.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestDTO {
    @NotBlank(message = "Service name is required")
    private String name;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double startingPrice;

    private String estimatedDuration; // e.g. "2 hours"
    private List<String> imageUrls;
    private String availability; // e.g. "9 AM - 6 PM"
    private String status; // e.g. "ACTIVE", "INACTIVE"
}
