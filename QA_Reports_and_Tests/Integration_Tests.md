# 🔗 Integration & API Testing Report

## Objective
Validate the end-to-end communication between various layers of the architecture (Frontend ↔ Backend, Backend ↔ Database, Backend ↔ ML Service, Backend ↔ Razorpay).

## Integration Scenarios

### 1. Frontend ↔ Backend
* **Tool Used:** Axios (React) & Spring Boot.
* **Test:** Submit login form on the React frontend.
* **Result:** The frontend successfully sends a POST request to `/api/auth/login`. The backend processes the request and returns a valid JWT. The frontend successfully parses the JWT and stores it in LocalStorage, updating the `AuthContext`.
* **Status:** 🟢 PASS

### 2. Backend ↔ Database (MySQL)
* **Tool Used:** Spring Data JPA / Hibernate.
* **Test:** Create a new booking via POST `/api/bookings`.
* **Result:** Hibernate successfully translates the Java object into an `INSERT INTO bookings...` SQL statement. The data is durably written to MySQL. Subsequent GET requests retrieve the exact data.
* **Status:** 🟢 PASS

### 3. Backend ↔ Machine Learning Service (FastAPI)
* **Tool Used:** Spring `RestTemplate` / `WebClient`.
* **Test:** Customer requests recommendations.
* **Result:** Spring Boot intercepts the `/api/ml/recommend` request and proxies it to the Python FastAPI running on port `8081`. FastAPI executes the Scikit-Learn model and returns JSON. Spring Boot relays this JSON back to the React frontend.
* **Status:** 🟢 PASS

### 4. Backend ↔ Razorpay API
* **Tool Used:** Razorpay Java SDK.
* **Test:** Customer initiates payment.
* **Result:** Backend successfully authenticates with Razorpay using API keys, generates an Order ID, and returns it to the client. Upon success, Razorpay webhook hits the backend endpoint, and the signature is successfully verified using the secret key.
* **Status:** 🟢 PASS

### 5. Backend ↔ Email Service (JavaMailSender)
* **Tool Used:** Spring Boot Mail.
* **Test:** User requests password reset.
* **Result:** System successfully dispatches an OTP email via SMTP. Email is received in the target inbox within 5 seconds.
* **Status:** 🟢 PASS

## API Tests (End-to-End)
A complete Postman suite covering all endpoints has been generated and validated. All API status codes conform to RESTful standards (200, 201, 400, 401, 403, 404).

*See `Postman_Complete_Test_Collection.json` for detailed execution payloads.*
