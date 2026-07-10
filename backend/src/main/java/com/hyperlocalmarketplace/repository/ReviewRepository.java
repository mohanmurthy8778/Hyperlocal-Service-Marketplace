package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Provider;
import com.hyperlocalmarketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProvider(Provider provider);
    List<Review> findByProviderId(Long providerId);
    List<Review> findByCustomerId(Long customerId);
}
