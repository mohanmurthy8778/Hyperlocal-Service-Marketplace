# 🛡️ Security Testing Report

## Objective
Ensure the "ServiceHub" Hyperlocal Marketplace application is secure against standard web vulnerabilities (OWASP Top 10) including injection, broken authentication, and cross-site scripting (XSS).

## Security Test Strategy
* Static Application Security Testing (SAST): SonarQube.
* Dynamic Application Security Testing (DAST): OWASP ZAP.
* Manual Penetration Testing: Postman & Browser DevTools.

## Results by Category

### 1. JWT Authentication & Session Management
* **Vulnerability Assessed:** Broken Authentication, JWT Forgery.
* **Tests Executed:**
  * Passed an expired JWT. Result: `401 Unauthorized`.
  * Passed a malformed JWT. Result: `401 Unauthorized`.
  * Attempted to alter JWT payload (changed role to `ADMIN`). Result: `401 Unauthorized` (Signature Verification Failed).
  * Tested refresh token rotation. Result: Previous refresh token invalidated upon use.
* **Status:** 🟢 PASS

### 2. SQL Injection (SQLi)
* **Vulnerability Assessed:** Injection.
* **Tests Executed:**
  * Appended `' OR 1=1 --` to email login field. Result: `401 Invalid Credentials` (Spring Data JPA prepared statements prevented execution).
  * Added SQL keywords to search API `q=cleaning; DROP TABLE users;`. Result: Properly escaped, no syntax errors or execution.
* **Status:** 🟢 PASS

### 3. Cross-Site Scripting (XSS)
* **Vulnerability Assessed:** Stored & Reflected XSS.
* **Tests Executed:**
  * Submitted a service review with payload: `<script>alert(1)</script>`.
  * Result: The React frontend properly escapes the HTML entities, rendering the literal text without executing the script.
* **Status:** 🟢 PASS

### 4. Cross-Site Request Forgery (CSRF)
* **Vulnerability Assessed:** CSRF.
* **Tests Executed:**
  * Since the application relies exclusively on stateless JWT tokens via the `Authorization: Bearer` header, standard cookie-based CSRF vectors are mitigated.
  * Verified that CORS policy restricts requests from unauthorized origins in `SecurityConfig.java`.
* **Status:** 🟢 PASS

### 5. Input Validation & Data Integrity
* **Tests Executed:**
  * Submitted negative booking amounts. Result: `400 Bad Request` (Validation constraint `@Min(0)` applied).
  * Attempted to upload `.exe` files as profile avatars. Result: `400 Bad Request` (Only JPEG/PNG accepted).
* **Status:** 🟢 PASS

### 6. Role-Based Access Control (RBAC)
* **Tests Executed:**
  * Attempted to access `/api/admin/dashboard` using a `CUSTOMER` token. Result: `403 Forbidden`.
  * Attempted to access `/api/provider/earnings` using a `CUSTOMER` token. Result: `403 Forbidden`.
* **Status:** 🟢 PASS

## Summary
The application demonstrates strong resilience to standard web vulnerabilities. Spring Security correctly enforces endpoint authorization, and React handles XSS mitigation gracefully.
