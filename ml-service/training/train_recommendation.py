import os
import pandas as pd
import numpy as np
import joblib
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler

def train_recommendation_model():
    print("Training Recommendation Model...")
    
    # Load datasets
    customers = pd.read_csv("ml-service/datasets/customers.csv")
    services = pd.read_csv("ml-service/datasets/services.csv")
    providers = pd.read_csv("ml-service/datasets/providers.csv")
    bookings = pd.read_csv("ml-service/datasets/bookings.csv")
    
    # We will build a Content-Based Collaborative filtering hybrid
    # Feature engineering for services: price, rating, review_count, provider's location
    services_with_providers = services.merge(providers, on="provider_id", suffixes=('', '_provider'))
    
    # Scale numerical features for similarity computation
    scaler = MinMaxScaler()
    numerical_features = ["price", "rating", "review_count", "completed_jobs", "response_time_mins"]
    scaled_features = scaler.fit_transform(services_with_providers[numerical_features])
    
    # One-hot encode category
    category_encoded = pd.get_dummies(services_with_providers["category"])
    
    # Combine features
    feature_matrix = np.hstack([scaled_features, category_encoded.values])
    
    # Train KNN on service feature matrix
    knn = NearestNeighbors(n_neighbors=10, metric="cosine")
    knn.fit(feature_matrix)
    
    # We save the model, the scaler, the service data, and category columns for one-hot encoding consistency
    model_data = {
        "knn": knn,
        "scaler": scaler,
        "feature_matrix": feature_matrix,
        "category_columns": category_encoded.columns.tolist(),
        "services_metadata": services_with_providers[[
            "service_id", "service_name", "category", "price", "rating", "provider_id", "name", "latitude", "longitude"
        ]].to_dict(orient="records")
    }
    
    os.makedirs("ml-service/saved_models", exist_ok=True)
    joblib.dump(model_data, "ml-service/saved_models/recommendation_model.pkl")
    print("Recommendation model saved successfully as recommendation_model.pkl!")

if __name__ == "__main__":
    train_recommendation_model()
