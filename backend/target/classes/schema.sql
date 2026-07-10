CREATE TABLE bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    provider_id VARCHAR(50),
    service_id VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(10, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    tracking_enabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE booking_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

CREATE TABLE provider_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id VARCHAR(50) NOT NULL,
    booking_id VARCHAR(50),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(10, 8) NOT NULL,
    accuracy DECIMAL(8, 2),
    speed DECIMAL(8, 2),
    heading DECIMAL(8, 2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_availability (
    provider_id VARCHAR(50) PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT FALSE,
    last_known_latitude DECIMAL(10, 8),
    last_known_longitude DECIMAL(10, 8),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
