# 🗄️ Database Testing Report

## Environment
* **Database:** MySQL 8.0
* **ORM:** Hibernate (Spring Data JPA)
* **Schema Engine:** Flyway / Hibernate ddl-auto

## Objectives
Validate relational integrity, constraints, indexes, transaction management, and rollback mechanisms.

## Test Results

### 1. Schema Validation & Constraints
* **Unique Constraints:** Tested creating multiple users with the same email. Expected: `DataIntegrityViolationException`. Result: Correctly threw constraint violation.
* **Foreign Key Constraints:** Attempted to delete a User who has active Bookings. Expected: Cannot delete due to FK constraint. Result: Blocked.
* **Not Null Constraints:** Submitted a service without a `price`. Expected: Rejection. Result: Blocked by `@NotNull`.
* **Status:** 🟢 PASS

### 2. Indexes & Performance
* **Query Execution Plans (`EXPLAIN`):**
  * `SELECT * FROM bookings WHERE provider_id = 1;` uses the index `idx_booking_provider`.
  * `SELECT * FROM services WHERE category_id = 2;` uses the index `idx_service_category`.
* **Status:** 🟢 PASS

### 3. Transaction Management (`@Transactional`)
* **Test Case:** Booking Creation & Payment Record.
* **Scenario:** A booking is created, but the payment record insertion throws a `RuntimeException`.
* **Expected Result:** The transaction rolls back, and the booking is not saved to the DB.
* **Actual Result:** Verified via logs and DB inspection that the rollback executed correctly.
* **Status:** 🟢 PASS

### 4. Concurrency & Locking
* **Test Case:** Two users attempt to book the exact same provider for the exact same time slot simultaneously.
* **Mechanism:** Optimistic Locking (`@Version`).
* **Result:** One transaction succeeds, the other throws `ObjectOptimisticLockingFailureException`. The user receives a friendly "Slot no longer available" message.
* **Status:** 🟢 PASS

## Conclusion
The relational schema is robust. Hibernate mappings correctly translate to highly constrained and indexed MySQL tables. Transaction boundaries prevent partial data updates.
