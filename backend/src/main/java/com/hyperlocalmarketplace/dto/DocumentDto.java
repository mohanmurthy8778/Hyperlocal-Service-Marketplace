package com.hyperlocalmarketplace.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDto {
    private Long id;
    private Long providerId;
    private String documentName;
    private String documentType;
    private String documentUrl;
    private boolean isVerified;
}
