package com.hyperlocalmarketplace.service;

public interface ReminderService {
    void processUpcomingServiceReminders();
    void processPaymentReminders();
    void processReviewReminders();
}
