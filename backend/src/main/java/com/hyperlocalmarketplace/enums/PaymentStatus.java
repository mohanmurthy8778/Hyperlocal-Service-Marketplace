package com.hyperlocalmarketplace.enums;

public enum PaymentStatus {
    PENDING,
    PROCESSING,
    SUCCESS,
    SUCCESSFUL, // alias/backward-compatibility
    FAILED,
    REFUNDED,
    CANCELLED
}
