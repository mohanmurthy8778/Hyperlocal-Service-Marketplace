package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Review Module", description = "Endpoints to leave ratings and feedback for service providers")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Submit a review/rating for a completed service booking")
    public ResponseEntity<ReviewResponse> addReview(Principal principal, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addReview(principal.getName(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing review/rating")
    public ResponseEntity<ReviewResponse> updateReview(Principal principal, @PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(principal.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing review")
    public ResponseEntity<Map<String, String>> deleteReview(Principal principal, @PathVariable Long id) {
        reviewService.deleteReview(principal.getName(), id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Review deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "View all customer reviews and ratings left for a specific provider")
    public ResponseEntity<List<ReviewResponse>> getProviderReviews(@PathVariable Long providerId) {
        return ResponseEntity.ok(reviewService.getReviewsForProvider(providerId));
    }

    @GetMapping("/provider/{providerId}/average")
    @Operation(summary = "Get overall aggregated average rating of a provider")
    public ResponseEntity<Map<String, Object>> getProviderAverageRating(@PathVariable Long providerId) {
        Double avgRating = reviewService.calculateAverageRating(providerId);
        Map<String, Object> response = new HashMap<>();
        response.put("providerId", providerId);
        response.put("averageRating", avgRating);
        return ResponseEntity.ok(response);
    }
}
