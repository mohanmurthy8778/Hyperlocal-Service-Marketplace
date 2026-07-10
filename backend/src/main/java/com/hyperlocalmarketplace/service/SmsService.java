package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.SmsNotificationRequest;

public interface SmsService {
    void sendSms(String phoneNumber, String message);
    void sendSms(SmsNotificationRequest request);
}
