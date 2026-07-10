package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.*;

public interface MLService {
    MLRecommendResponse getRecommendations(MLRecommendRequest request);
    MLPricePredictionResponse predictPrice(MLPricePredictionRequest request);
    MLFraudCheckResponse checkFraud(MLFraudCheckRequest request);
    MLCustomerAnalysisResponse analyzeCustomer(MLCustomerAnalysisRequest request);
    MLProviderRankingResponse rankProvider(MLProviderRankingRequest request);
}
