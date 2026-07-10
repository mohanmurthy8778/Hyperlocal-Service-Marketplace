import os
import pandas as pd
import numpy as np
import joblib
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def train_customer_analysis_model():
    print("Training Customer Preference Analysis Model...")
    
    # Load customer profiles and booking history
    customers = pd.read_csv("ml-service/datasets/customers.csv")
    bookings = pd.read_csv("ml-service/datasets/bookings.csv")
    
    # Aggregate customer booking behavior
    customer_spend = bookings.groupby("customer_id").agg(
        avg_spend=("price", "mean"),
        booking_count=("booking_id", "count"),
        pref_hour=("booking_time_hour", "mean")
    ).reset_index()
    
    # Merge with customer profiles
    profile = customers.merge(customer_spend, on="customer_id", how="left")
    profile["avg_spend"] = profile["avg_spend"].fillna(0)
    profile["booking_count"] = profile["booking_count"].fillna(0)
    profile["pref_hour"] = profile["pref_hour"].fillna(12)
    
    # Features for K-Means Clustering
    features = ["budget_limit", "avg_spend", "booking_count", "pref_hour"]
    X = profile[features]
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train K-Means
    num_clusters = 4
    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    
    # Map cluster indices to human-readable customer segments
    # 0 -> "Value Seeker", 1 -> "Premium Loyalist", 2 -> "Frequent User", 3 -> "Standard User"
    # We will compute segment labels based on centroids to make it dynamic and real
    centroids = kmeans.cluster_centers_
    # Sort clusters by average spend or budget to assign consistent semantic names
    cluster_order = np.argsort(centroids[:, 1])  # sort by avg_spend feature column index 1
    
    segment_names = {}
    segment_names[cluster_order[0]] = "Budget-Conscious Explorer"
    segment_names[cluster_order[1]] = "Balanced Homeowner"
    segment_names[cluster_order[2]] = "Frequent High-Spender"
    segment_names[cluster_order[3]] = "Premium Connoisseur"
    
    model_data = {
        "kmeans": kmeans,
        "scaler": scaler,
        "features": features,
        "segment_names": segment_names,
        "centroids": centroids.tolist(),
        "customer_profiles": profile.to_dict(orient="records")
    }
    
    os.makedirs("ml-service/saved_models", exist_ok=True)
    joblib.dump(model_data, "ml-service/saved_models/customer_analysis.pkl")
    print("Customer preference analysis model saved successfully as customer_analysis.pkl!")

if __name__ == "__main__":
    train_customer_analysis_model()
