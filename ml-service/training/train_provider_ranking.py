import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

def train_provider_ranking_model():
    print("Training Provider Ranking Model...")
    
    # Load providers dataset
    df_providers = pd.read_csv("ml-service/datasets/providers.csv")
    
    # Calculate synthetic score for training
    # Good metrics increase score: rating, completed_jobs, acceptance_rate, revenue
    # Bad metrics decrease score: response_time_mins, cancellation_rate
    rating_norm = (df_providers["rating"] - 3.0) / 2.0  # scale from 3-5 to 0-1
    jobs_norm = np.clip(df_providers["completed_jobs"] / 100.0, 0, 1)
    response_norm = 1.0 - np.clip(df_providers["response_time_mins"] / 60.0, 0, 1)
    acceptance_norm = df_providers["acceptance_rate"]
    cancellation_norm = 1.0 - df_providers["cancellation_rate"]
    revenue_norm = np.clip(df_providers["revenue"] / 100000.0, 0, 1)
    
    # Weighted score calculation (ground truth target)
    target_score = (
        rating_norm * 0.30 +
        jobs_norm * 0.20 +
        response_norm * 0.15 +
        acceptance_norm * 0.15 +
        cancellation_norm * 0.10 +
        revenue_norm * 0.10
    ) * 100.0
    
    df_providers["provider_score"] = target_score
    
    # Features for Random Forest Regressor
    features = [
        "rating", "completed_jobs", "response_time_mins", 
        "acceptance_rate", "cancellation_rate", "revenue"
    ]
    X = df_providers[features]
    y = df_providers["provider_score"]
    
    # Train scaler and regressor
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)
    
    print(f"Provider Ranking Model R2 Score: {model.score(X_scaled, y):.4f}")
    
    model_data = {
        "model": model,
        "scaler": scaler,
        "features": features,
        "providers_data": df_providers.to_dict(orient="records")
    }
    
    os.makedirs("ml-service/saved_models", exist_ok=True)
    joblib.dump(model_data, "ml-service/saved_models/provider_ranking.pkl")
    print("Provider ranking model saved successfully as provider_ranking.pkl!")

if __name__ == "__main__":
    train_provider_ranking_model()
