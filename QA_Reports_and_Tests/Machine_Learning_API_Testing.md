# 🧠 Machine Learning API Testing Report

## Objective
Validate the accuracy, responsiveness, and error handling of the ML microservice built with Python (FastAPI) and Scikit-Learn.

## API Endpoints Verified

### 1. Recommendation API (`/ml/recommendations`)
* **Purpose:** Suggests services to customers based on past booking history and preferences.
* **Test Case:** Pass `customer_id: 1`
* **Expected Result:** List of 5 recommended services sorted by `recommendation_score` descending.
* **Actual Result:** Returned 5 items in 410ms. Top item matched customer's previous category preference.
* **Status:** 🟢 PASS

### 2. Price Prediction API (`/ml/price-prediction`)
* **Purpose:** Dynamically predicts optimal pricing based on demand and provider rating.
* **Test Case:** Base price 500, Demand Index 1.5, Provider Rating 4.9.
* **Expected Result:** Predicted price > 500.
* **Actual Result:** Returned `predicted_price: 816.66`, `confidence_score: 0.94`.
* **Status:** 🟢 PASS

### 3. Fraud Detection API (`/ml/fraud-check`)
* **Purpose:** Flags anomalous payment amounts or booking frequencies.
* **Test Case 1:** Normal transaction (`amount: 50`). Result: `risk_level: Safe`.
* **Test Case 2:** Extremely high transaction (`amount: 50000`). Result: `risk_level: Review`.
* **Status:** 🟢 PASS

### 4. Customer Analysis API (`/ml/customer-analysis`)
* **Purpose:** Segments customers for targeted marketing.
* **Test Case:** User with 10+ bookings in 1 month.
* **Actual Result:** Returned `segment: High Value Frequent Buyer`.
* **Status:** 🟢 PASS

### 5. Provider Ranking API (`/ml/provider-ranking`)
* **Purpose:** Ranks providers within a category based on ratings and completion rate.
* **Test Case:** Provider with 4.9 rating and 0 cancellations.
* **Actual Result:** Returned `provider_score: 98.5`, `rank: 1`.
* **Status:** 🟢 PASS

## Error Handling & Edge Cases
* **Invalid Input:** Passing string where integer is expected (e.g., `customer_id: "abc"`) correctly yields a `422 Unprocessable Entity` from FastAPI's Pydantic validation.
* **Missing Data:** Requesting recommendations for a brand new user with no history falls back to returning the top globally trending services.

## Conclusion
The ML API successfully integrates with the Java backend. Latency is within acceptable bounds (< 800ms) and model inferences reflect logical, expected outcomes based on the simulated dataset.
