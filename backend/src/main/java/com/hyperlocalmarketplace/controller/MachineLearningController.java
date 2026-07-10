package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.service.MLService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
@Tag(name = "Machine Learning Controller", description = "Endpoints integrating predictive, recommendation, fraud detection, and analytic intelligence systems")
@SecurityRequirement(name = "Bearer Authentication")
public class MachineLearningController {

    private static final Logger log = LoggerFactory.getLogger(MachineLearningController.class);

    @Autowired
    private MLService mlService;

    @PostMapping("/recommendations")
    @Operation(summary = "Get smart personalized service recommendations for a customer based on historical profiles and distance")
    public ResponseEntity<MLRecommendResponse> getRecommendations(@Valid @RequestBody MLRecommendRequest request) {
        log.info("Received request for customer service recommendations: {}", request.getCustomerId());
        MLRecommendResponse response = mlService.getRecommendations(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/price-prediction")
    @Operation(summary = "Predict optimal market pricing for services using category, demand, and provider ratings")
    public ResponseEntity<MLPricePredictionResponse> predictPrice(@Valid @RequestBody MLPricePredictionRequest request) {
        log.info("Received request for pricing prediction: Category={}, Demand={}", request.getCategory(), request.getDemandIndex());
        MLPricePredictionResponse response = mlService.predictPrice(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fraud-check")
    @Operation(summary = "Analyze user transaction behaviors and metadata to flag potential system frauds")
    public ResponseEntity<MLFraudCheckResponse> checkFraud(@Valid @RequestBody MLFraudCheckRequest request) {
        log.info("Received request for transaction fraud check for customer ID: {}", request.getCustomerId());
        MLFraudCheckResponse response = mlService.checkFraud(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/customer-analysis")
    @Operation(summary = "Analyze favorite categories, preferred booking times, budget tiers, and segments for customer profiling")
    public ResponseEntity<MLCustomerAnalysisResponse> analyzeCustomer(@Valid @RequestBody MLCustomerAnalysisRequest request) {
        log.info("Received request for customer preference analysis for customer ID: {}", request.getCustomerId());
        MLCustomerAnalysisResponse response = mlService.analyzeCustomer(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/provider-ranking")
    @Operation(summary = "Rank service providers based on historical ratings, response times, and total completed jobs")
    public ResponseEntity<MLProviderRankingResponse> rankProvider(@Valid @RequestBody MLProviderRankingRequest request) {
        log.info("Received request for provider performance ranking for provider ID: {}", request.getProviderId());
        MLProviderRankingResponse response = mlService.rankProvider(request);
        return ResponseEntity.ok(response);
    }
}
