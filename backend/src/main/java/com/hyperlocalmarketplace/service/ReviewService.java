package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.*;
import java.util.List;

public interface ReviewService {
    // Original methods
    ReviewResponse addReview(String customerEmail, ReviewRequest request);
    ReviewResponse updateReview(String customerEmail, Long reviewId, ReviewRequest request);
    void deleteReview(String customerEmail, Long reviewId);
    List<ReviewResponse> getReviewsForProvider(Long providerId);
    Double calculateAverageRating(Long providerId);

    // New Customer-specific Module methods
    ReviewDTO createCustomerReview(String email, ReviewDTO dto);
    ReviewDTO updateCustomerReview(String email, Long id, ReviewDTO dto);
    void deleteCustomerReview(String email, Long id);
}
