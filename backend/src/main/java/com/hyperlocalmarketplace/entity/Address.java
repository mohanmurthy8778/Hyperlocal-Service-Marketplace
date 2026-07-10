package com.hyperlocalmarketplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String houseNumber;

    private String street;

    private String area;

    private String city;

    private String district;

    private String state;

    private String country;

    private String postalCode;

    private Double latitude;

    private Double longitude;

    private boolean isDefault = false;
}
