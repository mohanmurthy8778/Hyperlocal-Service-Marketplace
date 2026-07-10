import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

def train_fraud_detection_model():
    print("Training Fraud Detection Model...")
    
    # Load bookings and payments data to aggregate customer history
    bookings = pd.read_csv("ml-service/datasets/bookings.csv")
    payments = pd.read_csv("ml-service/datasets/payments.csv")
    
    # Aggregate user stats: cancellations, refund requests, payment failures, etc.
    customer_stats = bookings.groupby("customer_id").agg(
        total_bookings=("booking_id", "count"),
        cancellations=("status", lambda x: (x == "Cancelled").sum()),
        refund_requests=("refund_requested", "sum"),
        payment_failures=("payment_failed_count", "sum")
    ).reset_index()
    
    # Calculate rates
    customer_stats["cancellation_rate"] = customer_stats["cancellations"] / customer_stats["total_bookings"]
    customer_stats["refund_rate"] = customer_stats["refund_requests"] / customer_stats["total_bookings"]
    customer_stats["failure_rate"] = customer_stats["payment_failures"] / customer_stats["total_bookings"]
    
    # Add fake review flags (synthetic indicator: rating given is very low while other ratings are high)
    # Let's say if average rating given by a user is < 1.5, we flag it as potential fake review behaviors
    user_avg_rating = bookings.groupby("customer_id")["rating_given"].mean().reset_index()
    customer_stats = customer_stats.merge(user_avg_rating, on="customer_id")
    customer_stats["fake_reviews_flag"] = np.where(customer_stats["rating_given"] < 2.0, 1, 0)
    
    # Select features for fraud/anomaly detection
    features = ["cancellation_rate", "refund_rate", "failure_rate", "fake_reviews_flag", "refund_requests"]
    X = customer_stats[features]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Fit Isolation Forest (unsupervised anomaly detection)
    # contamination represents the expected proportion of outliers (fraudulent profiles) in the dataset
    clf = IsolationForest(contamination=0.08, random_state=42)
    clf.fit(X_scaled)
    
    model_data = {
        "model": clf,
        "scaler": scaler,
        "features": features,
        "customer_stats": customer_stats.to_dict(orient="records")
    }
    
    os.makedirs("ml-service/saved_models", exist_ok=True)
    joblib.dump(model_data, "ml-service/saved_models/fraud_detection.pkl")
    print("Fraud detection model saved successfully as fraud_detection.pkl!")

if __name__ == "__main__":
    train_fraud_detection_model()
