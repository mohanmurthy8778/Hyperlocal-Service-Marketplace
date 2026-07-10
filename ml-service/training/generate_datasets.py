import os
import pandas as pd
import numpy as np

# Ensure directories exist
os.makedirs("ml-service/datasets", exist_ok=True)
os.makedirs("ml-service/saved_models", exist_ok=True)

print("Generating synthetic datasets for Hyperlocal Marketplace ML service...")

# 1. Customers Dataset
np.random.seed(42)
num_customers = 100
categories = ["Cleaning Services", "Plumbing", "Electrical", "Home Appliances", "Beauty & Salon", "Gardening", "Pest Control"]

customers_data = {
    "customer_id": range(1, num_customers + 1),
    "name": [f"Customer {i}" for i in range(1, num_customers + 1)],
    "favorite_category": np.random.choice(categories, num_customers),
    "budget_limit": np.random.choice([1000, 2000, 3000, 5000, 8000, 10000], num_customers),
    "latitude": np.random.uniform(12.90, 13.10, num_customers),  # Local Bangalore coordinates
    "longitude": np.random.uniform(77.50, 77.70, num_customers)
}
df_customers = pd.DataFrame(customers_data)
df_customers.to_csv("ml-service/datasets/customers.csv", index=False)

# 2. Providers Dataset
num_providers = 50
providers_data = {
    "provider_id": range(1, num_providers + 1),
    "name": [f"Provider {i}" for i in range(1, num_providers + 1)],
    "category": np.random.choice(categories, num_providers),
    "latitude": np.random.uniform(12.90, 13.10, num_providers),
    "longitude": np.random.uniform(77.50, 77.70, num_providers),
    "base_price": np.random.choice([300, 500, 800, 1200, 1500, 2000], num_providers),
    "rating": np.random.uniform(3.5, 5.0, num_providers),
    "completed_jobs": np.random.randint(5, 150, num_providers),
    "response_time_mins": np.random.randint(5, 60, num_providers),
    "acceptance_rate": np.random.uniform(0.70, 1.0, num_providers),
    "cancellation_rate": np.random.uniform(0.0, 0.20, num_providers),
    "revenue": np.random.randint(5000, 150000, num_providers)
}
df_providers = pd.DataFrame(providers_data)
df_providers.to_csv("ml-service/datasets/providers.csv", index=False)

# 3. Services Dataset
num_services = 100
services_data = {
    "service_id": range(1, num_services + 1),
    "provider_id": np.random.choice(df_providers["provider_id"], num_services),
    "service_name": [f"Service {i}" for i in range(1, num_services + 1)],
    "category": np.random.choice(categories, num_services),
    "price": np.random.randint(200, 5000, num_services),
    "rating": np.random.uniform(4.0, 5.0, num_services),
    "review_count": np.random.randint(0, 80, num_services)
}
df_services = pd.DataFrame(services_data)
df_services.to_csv("ml-service/datasets/services.csv", index=False)

# 4. Bookings Dataset
num_bookings = 1000
bookings_data = {
    "booking_id": range(1, num_bookings + 1),
    "customer_id": np.random.choice(df_customers["customer_id"], num_bookings),
    "service_id": np.random.choice(df_services["service_id"], num_bookings),
    "booking_time_hour": np.random.randint(8, 22, num_bookings),
    "price": np.random.randint(200, 5000, num_bookings),
    "status": np.random.choice(["Completed", "Cancelled", "Pending"], num_bookings, p=[0.8, 0.15, 0.05]),
    "rating_given": np.random.choice([1, 2, 3, 4, 5], num_bookings, p=[0.02, 0.03, 0.1, 0.35, 0.5]),
    "refund_requested": np.random.choice([0, 1], num_bookings, p=[0.95, 0.05]),
    "payment_failed_count": np.random.choice([0, 1, 2, 3], num_bookings, p=[0.9, 0.07, 0.02, 0.01])
}
df_bookings = pd.DataFrame(bookings_data)
df_bookings.to_csv("ml-service/datasets/bookings.csv", index=False)

# 5. Payments Dataset
payments_data = {
    "payment_id": range(1, num_bookings + 1),
    "booking_id": range(1, num_bookings + 1),
    "amount": df_bookings["price"],
    "status": np.where(df_bookings["status"] == "Cancelled", "Failed", "Success"),
    "multiple_failures_count": np.random.choice([0, 1, 2, 3], num_bookings, p=[0.92, 0.05, 0.02, 0.01])
}
df_payments = pd.DataFrame(payments_data)
df_payments.to_csv("ml-service/datasets/payments.csv", index=False)

# 6. Reviews Dataset
num_reviews = 400
reviews_data = {
    "review_id": range(1, num_reviews + 1),
    "booking_id": np.random.choice(df_bookings["booking_id"], num_reviews, replace=False),
    "rating": np.random.choice([1, 2, 3, 4, 5], num_reviews, p=[0.01, 0.03, 0.08, 0.38, 0.5]),
    "comment": np.random.choice([
        "Excellent service!", "Very professional", "Prompt and neat", "Average work done", 
        "The provider was late", "High quality and polite", "Loved it!", "Could be better"
    ], num_reviews)
}
# Link service_id from bookings
df_reviews = pd.DataFrame(reviews_data)
df_reviews = df_reviews.merge(df_bookings[["booking_id", "service_id"]], on="booking_id", how="left")
df_reviews.to_csv("ml-service/datasets/reviews.csv", index=False)

# 7. Favorites Dataset
num_favorites = 150
favorites_data = {
    "favorite_id": range(1, num_favorites + 1),
    "customer_id": np.random.choice(df_customers["customer_id"], num_favorites),
    "service_id": np.random.choice(df_services["service_id"], num_favorites)
}
df_favorites = pd.DataFrame(favorites_data)
df_favorites.to_csv("ml-service/datasets/favorites.csv", index=False)

print("Successfully generated all 7 CSV datasets in ml-service/datasets!")
