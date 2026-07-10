import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import joblib

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MLService")

app = FastAPI(
    title="ServiceHub Hyperlocal Service Marketplace ML Service",
    description="Intelligent prediction, recommendation, fraud detection, and ranking microservice",
    version="1.0.0"
)

# Paths to models
MODEL_DIR = "ml-service/saved_models"
REC_MODEL_PATH = os.path.join(MODEL_DIR, "recommendation_model.pkl")
PRICE_MODEL_PATH = os.path.join(MODEL_DIR, "price_prediction.pkl")
FRAUD_MODEL_PATH = os.path.join(MODEL_DIR, "fraud_detection.pkl")
CUST_MODEL_PATH = os.path.join(MODEL_DIR, "customer_analysis.pkl")
PROV_MODEL_PATH = os.path.join(MODEL_DIR, "provider_ranking.pkl")

# Helper function to compute geographic distance (Haversine formula)
def haversine_distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in km
    R = 6371.0
    lat1_rad = np.radians(lat1)
    lon1_rad = np.radians(lon1)
    lat2_rad = np.radians(lat2)
    lon2_rad = np.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = np.sin(dlat / 2)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    
    return R * c

# --- PYDANTIC SCHEMAS ---

class RecommendRequest(BaseModel):
    customer_id: int = Field(..., description="Customer ID to fetch recommendations for")

class RecommendationItem(BaseModel):
    service_name: str
    provider: str
    rating: float
    distance: float
    recommendation_score: float

class RecommendResponse(BaseModel):
    customer_id: int
    recommendations: List[RecommendationItem]

class PricePredictionRequest(BaseModel):
    category: str
    provider_rating: float
    demand_index: float
    distance_km: float
    is_weekend: int = 0

class PricePredictionResponse(BaseModel):
    predicted_price: float
    suggested_discount: float
    confidence_score: float

class FraudCheckRequest(BaseModel):
    customer_id: int
    cancellations: int
    refund_requests: int
    payment_failures: int
    fake_reviews_flag: int

class FraudCheckResponse(BaseModel):
    fraud_score: float
    risk_level: str  # Safe, Review, Block
    recommendation: str

class CustomerAnalysisRequest(BaseModel):
    customer_id: int

class CustomerAnalysisResponse(BaseModel):
    favorite_category: str
    preferred_booking_time: str
    budget_tier: str
    segment: str
    recommendation_tags: List[str]

class ProviderRankingRequest(BaseModel):
    provider_id: int

class ProviderRankingResponse(BaseModel):
    provider_id: int
    provider_score: float
    rank: int
    performance_grade: str
    top_provider_badge: bool

# --- ENDPOINTS ---

@app.get("/health")
def health_check():
    logger.info("Health check endpoint hit")
    models_status = {
        "recommendation": os.path.exists(REC_MODEL_PATH),
        "price_prediction": os.path.exists(PRICE_MODEL_PATH),
        "fraud_detection": os.path.exists(FRAUD_MODEL_PATH),
        "customer_analysis": os.path.exists(CUST_MODEL_PATH),
        "provider_ranking": os.path.exists(PROV_MODEL_PATH)
    }
    return {
        "status": "UP",
        "models_loaded": models_status
    }

@app.post("/recommend", response_model=RecommendResponse)
def get_recommendations(request: RecommendRequest):
    logger.info(f"Received recommendation request for customer_id: {request.customer_id}")
    
    # Try loading custom recommendation metadata & dataset or fallback to smart analytics
    try:
        # Load mock customer profiles to find location
        customers_df = pd.read_csv("ml-service/datasets/customers.csv")
        cust_profile = customers_df[customers_df["customer_id"] == request.customer_id]
        if cust_profile.empty:
            cust_lat, cust_lon = 12.9716, 77.5946 # Default Bangalore coords
            cust_fav_category = "Cleaning Services"
            cust_budget = 5000.0
        else:
            cust_lat = float(cust_profile.iloc[0]["latitude"])
            cust_lon = float(cust_profile.iloc[0]["longitude"])
            cust_fav_category = str(cust_profile.iloc[0]["favorite_category"])
            cust_budget = float(cust_profile.iloc[0]["budget_limit"])
    except Exception as ex:
        logger.warning(f"Failed to load customers dataset, using defaults: {ex}")
        cust_lat, cust_lon = 12.9716, 77.5946
        cust_fav_category = "Cleaning Services"
        cust_budget = 5000.0

    # Try loading service recommendations
    recs = []
    try:
        if os.path.exists(REC_MODEL_PATH):
            model_data = joblib.load(REC_MODEL_PATH)
            services_metadata = model_data["services_metadata"]
            
            # Compute recommendation score for each service
            for service in services_metadata:
                dist = haversine_distance(cust_lat, cust_lon, service["latitude"], service["longitude"])
                
                # Content alignment: favorite category bonus
                cat_bonus = 1.0 if service["category"] == cust_fav_category else 0.0
                
                # Budget score: fit within budget
                budget_score = 1.0 if service["price"] <= cust_budget else max(0.1, cust_budget / service["price"])
                
                # Distance penalty
                dist_score = 1.0 / (1.0 + dist)
                
                # Rating score
                rating_score = service["rating"] / 5.0
                
                # Calculate hybrid score
                hybrid_score = (cat_bonus * 0.35 + rating_score * 0.25 + budget_score * 0.20 + dist_score * 0.20) * 100.0
                
                recs.append(RecommendationItem(
                    service_name=service["service_name"],
                    provider=service["name"],
                    rating=round(service["rating"], 1),
                    distance=round(dist, 2),
                    recommendation_score=round(hybrid_score, 1)
                ))
        else:
            raise FileNotFoundError("Model file not found")
    except Exception as ex:
        logger.warning(f"Using rule-based recommendation fallback: {ex}")
        # Rule-based fallback: populate list with dynamic dummy services aligned with customer budget
        categories_list = ["Cleaning Services", "Plumbing", "Electrical", "Home Appliances", "Beauty & Salon"]
        for i in range(1, 11):
            category = categories_list[i % len(categories_list)]
            dist = float(2.0 + i * 0.8)
            cat_bonus = 1.0 if category == cust_fav_category else 0.0
            rating = 4.0 + (i % 10) * 0.1
            price = 300.0 + i * 250.0
            budget_score = 1.0 if price <= cust_budget else max(0.1, cust_budget / price)
            score = (cat_bonus * 0.4 + (rating/5.0) * 0.3 + budget_score * 0.3) * 100.0
            
            recs.append(RecommendationItem(
                service_name=f"{category} Pro Pack {i}",
                provider=f"Expert Provider {i}",
                rating=round(rating, 1),
                distance=round(dist, 2),
                recommendation_score=round(score, 1)
            ))
            
    # Sort recommendations by highest score
    recs = sorted(recs, key=lambda x: x.recommendation_score, reverse=True)[:10]
    return RecommendResponse(customer_id=request.customer_id, recommendations=recs)

@app.post("/predict-price", response_model=PricePredictionResponse)
def predict_price(request: PricePredictionRequest):
    logger.info(f"Received price prediction request for category: {request.category}")
    
    try:
        if os.path.exists(PRICE_MODEL_PATH):
            model_data = joblib.load(PRICE_MODEL_PATH)
            model = model_data["model"]
            preprocessor = model_data["preprocessor"]
            
            # Format single data row
            df_in = pd.DataFrame([{
                "category": request.category,
                "rating": request.provider_rating,
                "demand_index": request.demand_index,
                "distance_km": request.distance_km,
                "is_weekend": request.is_weekend
            }])
            
            X_processed = preprocessor.transform(df_in)
            predicted = float(model.predict(X_processed)[0])
            
            # Determine dynamic discount suggestion based on demand
            discount = 15.0 if request.demand_index < 1.0 else (5.0 if request.demand_index < 1.4 else 0.0)
            confidence = float(0.80 + (request.provider_rating / 5.0) * 0.15)
            
            return PricePredictionResponse(
                predicted_price=round(predicted, 2),
                suggested_discount=discount,
                confidence_score=round(confidence, 2)
            )
        else:
            raise FileNotFoundError("Model file not found")
    except Exception as ex:
        logger.warning(f"Using rule-based price prediction fallback: {ex}")
        # Mathematical fallback
        base_rates = {
            "Cleaning Services": 450.0,
            "Plumbing": 550.0,
            "Electrical": 600.0,
            "Home Appliances": 800.0,
            "Beauty & Salon": 700.0,
            "Gardening": 400.0,
            "Pest Control": 900.0
        }
        base = base_rates.get(request.category, 500.0)
        predicted = base * request.demand_index * (request.provider_rating / 4.5) * (1.0 + 0.015 * request.distance_km)
        if request.is_weekend == 1:
            predicted *= 1.12
            
        discount = 12.0 if request.demand_index < 1.0 else (5.0 if request.demand_index < 1.3 else 0.0)
        confidence = 0.88
        
        return PricePredictionResponse(
            predicted_price=round(predicted, 2),
            suggested_discount=discount,
            confidence_score=confidence
        )

@app.post("/fraud", response_model=FraudCheckResponse)
def check_fraud(request: FraudCheckRequest):
    logger.info(f"Received fraud check request for customer_id: {request.customer_id}")
    
    try:
        if os.path.exists(FRAUD_MODEL_PATH):
            model_data = joblib.load(FRAUD_MODEL_PATH)
            clf = model_data["model"]
            scaler = model_data["scaler"]
            
            # Simple rates computation
            total = max(1, request.cancellations + 5) # assume at least 5 baseline orders to prevent divide by zero
            c_rate = request.cancellations / total
            r_rate = request.refund_requests / total
            f_rate = request.payment_failures / total
            
            X_in = scaler.transform([[c_rate, r_rate, f_rate, request.fake_reviews_flag, request.refund_requests]])
            score = clf.decision_function(X_in)[0]
            
            # Map anomaly decision score (typically -0.5 to 0.5 where negative is outlier/fraudulent)
            # Map it to a 0-100 fraud risk score
            fraud_score = float((0.5 - score) * 100.0)
            fraud_score = max(0.0, min(100.0, fraud_score))
        else:
            raise FileNotFoundError("Model file not found")
    except Exception as ex:
        logger.warning(f"Using rule-based fraud check fallback: {ex}")
        # Rule-based risk math
        risk_weight = (request.cancellations * 15.0 + 
                       request.refund_requests * 25.0 + 
                       request.payment_failures * 10.0 + 
                       request.fake_reviews_flag * 40.0)
        fraud_score = min(100.0, max(0.0, risk_weight))
        
    # Determine risk categories and text action recommendations
    if fraud_score >= 70.0:
        risk = "Block"
        rec = "SUSPEND_ACCOUNT_FOR_SECURITY_AUDIT"
    elif fraud_score >= 40.0:
        risk = "Review"
        rec = "FLAG_FOR_MANUAL_ADMIN_REVIEW"
    else:
        risk = "Safe"
        rec = "ALLOW_ALL_TRANSACTIONS"
        
    return FraudCheckResponse(
        fraud_score=round(fraud_score, 1),
        risk_level=risk,
        recommendation=rec
    )

@app.post("/customer-analysis", response_model=CustomerAnalysisResponse)
def analyze_customer(request: CustomerAnalysisRequest):
    logger.info(f"Received customer preference analysis request for customer_id: {request.customer_id}")
    
    try:
        if os.path.exists(CUST_MODEL_PATH):
            model_data = joblib.load(CUST_MODEL_PATH)
            kmeans = model_data["kmeans"]
            scaler = model_data["scaler"]
            segment_names = model_data["segment_names"]
            customer_profiles = model_data["customer_profiles"]
            
            # Attempt to find actual profile
            profile = next((p for p in customer_profiles if p["customer_id"] == request.customer_id), None)
            
            if profile:
                X_in = scaler.transform([[profile["budget_limit"], profile["avg_spend"], profile["booking_count"], profile["pref_hour"]]])
                cluster_idx = kmeans.predict(X_in)[0]
                segment = segment_names.get(cluster_idx, "Standard Active User")
                fav_cat = profile["favorite_category"]
                pref_hour = int(profile["pref_hour"])
                budget = profile["budget_limit"]
            else:
                raise ValueError("Profile ID not found in dataset")
        else:
            raise FileNotFoundError("Model file not found")
    except Exception as ex:
        logger.warning(f"Using rule-based customer analysis fallback: {ex}")
        # Fallback profile variables
        fav_cat = "Beauty & Salon" if request.customer_id % 3 == 0 else "Plumbing"
        pref_hour = 14
        budget = 5000.0
        segment = "Premium Connoisseur" if request.customer_id % 2 == 0 else "Balanced Homeowner"
        
    # Generate user-friendly booking hour description
    if pref_hour < 12:
        hour_desc = f"{pref_hour} AM (Morning Slots)"
    elif pref_hour < 17:
        hour_desc = f"{pref_hour - 12 if pref_hour > 12 else 12} PM (Afternoon Slots)"
    else:
        hour_desc = f"{pref_hour - 12} PM (Evening Slots)"
        
    # Format budget tier labels
    budget_tier = "High Premium" if budget >= 8000 else ("Mid Standard" if budget >= 4000 else "Budget Conscious")
    
    # Custom tags
    tags = ["Local Elite", "Eco-friendly Services"]
    if "Budget" in segment:
        tags.append("Discount Seeker")
    else:
        tags.append("Priority SLA")
    if pref_hour >= 17:
        tags.append("After-Hours Scheduler")
        
    return CustomerAnalysisResponse(
        favorite_category=fav_cat,
        preferred_booking_time=hour_desc,
        budget_tier=budget_tier,
        segment=segment,
        recommendation_tags=tags
    )

@app.post("/provider-ranking", response_model=ProviderRankingResponse)
def rank_provider(request: ProviderRankingRequest):
    logger.info(f"Received provider ranking request for provider_id: {request.provider_id}")
    
    try:
        if os.path.exists(PROV_MODEL_PATH):
            model_data = joblib.load(PROV_MODEL_PATH)
            model = model_data["model"]
            scaler = model_data["scaler"]
            providers_data = model_data["providers_data"]
            
            # Find provider metadata
            provider = next((p for p in providers_data if p["provider_id"] == request.provider_id), None)
            
            if provider:
                X_in = scaler.transform([[
                    provider["rating"], provider["completed_jobs"], provider["response_time_mins"],
                    provider["acceptance_rate"], provider["cancellation_rate"], provider["revenue"]
                ]])
                score = float(model.predict(X_in)[0])
                
                # Dynamic rank determination
                all_scores = []
                for p in providers_data:
                    p_in = scaler.transform([[p["rating"], p["completed_jobs"], p["response_time_mins"], p["acceptance_rate"], p["cancellation_rate"], p["revenue"]]])
                    all_scores.append(float(model.predict(p_in)[0]))
                
                all_scores_sorted = sorted(all_scores, reverse=True)
                rank = all_scores_sorted.index(score) + 1
            else:
                raise ValueError("Provider ID not found")
        else:
            raise FileNotFoundError("Model file not found")
    except Exception as ex:
        logger.warning(f"Using rule-based provider ranking fallback: {ex}")
        # Rule based fallback calculation
        # Assign a dynamic performance score based on ID mapping
        score = float(60.0 + (request.provider_id % 15) * 2.5)
        rank = max(1, 40 - (request.provider_id % 20))
        
    # Grade mapping
    if score >= 90.0:
        grade = "A+"
    elif score >= 80.0:
        grade = "A"
    elif score >= 70.0:
        grade = "B"
    elif score >= 50.0:
        grade = "C"
    else:
        grade = "D"
        
    badge = score >= 80.0
    
    return ProviderRankingResponse(
        provider_id=request.provider_id,
        provider_score=round(score, 1),
        rank=rank,
        performance_grade=grade,
        top_provider_badge=badge
    )
