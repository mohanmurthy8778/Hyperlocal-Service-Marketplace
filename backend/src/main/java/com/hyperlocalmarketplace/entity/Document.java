package com.hyperlocalmarketplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(nullable = false)
    private String documentName;

    @Column(nullable = false)
    private String documentType; // e.g. ID_PROOF, LICENSE, CERTIFICATE

    @Column(nullable = false)
    private String documentUrl;

    private boolean isVerified = false;
}
