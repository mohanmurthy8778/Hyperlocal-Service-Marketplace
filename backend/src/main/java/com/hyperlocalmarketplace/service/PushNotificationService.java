package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.PushNotificationRequest;

public interface PushNotificationService {
    void registerToken(String email, String token);
    void removeToken(String email, String token);
    void sendPushNotification(PushNotificationRequest request);
    void sendPushNotificationToUser(Long userId, String title, String message);
}
