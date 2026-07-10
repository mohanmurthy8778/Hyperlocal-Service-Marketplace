import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

def train_price_prediction_model():
    print("Training Dynamic Price Prediction Model...")
    
    # Load datasets
    services = pd.read_csv("ml-service/datasets/services.csv")
    providers = pd.read_csv("ml-service/datasets/providers.csv")
    
    # Merge services and providers
    df = services.merge(providers, on="provider_id", suffixes=('', '_provider'))
    
    # Generate some synthetic demand indices and distances for training
    np.random.seed(42)
    df["demand_index"] = np.random.uniform(0.8, 1.8, len(df))
    df["distance_km"] = np.random.uniform(0.5, 15.0, len(df))
    df["is_weekend"] = np.random.choice([0, 1], len(df), p=[0.71, 0.29])
    
    # Calculate target variable: optimal price (influenced by rating, demand, distance, weekend)
    # Price should increase with higher rating, higher demand, longer distance, and weekend surges
    df["target_optimal_price"] = df["price"] * (df["rating"] / 4.5) * (df["demand_index"]) * (1.0 + 0.02 * df["distance_km"])
    df.loc[df["is_weekend"] == 1, "target_optimal_price"] *= 1.10
    
    # Select features
    features = ["category", "rating", "demand_index", "distance_km", "is_weekend"]
    X = df[features]
    y = df["target_optimal_price"]
    
    # Preprocessor for categorical variable 'category'
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), ['category'])
        ],
        remainder='passthrough'
    )
    
    # Apply preprocessing
    X_processed = preprocessor.fit_transform(X)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42)
    
    # Train Random Forest Regressor
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"Random Forest Regressor - Train R2 Score: {train_score:.4f}, Test R2 Score: {test_score:.4f}")
    
    # Save model and preprocessor
    model_data = {
        "model": model,
        "preprocessor": preprocessor,
        "features": features
    }
    
    os.makedirs("ml-service/saved_models", exist_ok=True)
    joblib.dump(model_data, "ml-service/saved_models/price_prediction.pkl")
    print("Price prediction model saved successfully as price_prediction.pkl!")

if __name__ == "__main__":
    train_price_prediction_model()
