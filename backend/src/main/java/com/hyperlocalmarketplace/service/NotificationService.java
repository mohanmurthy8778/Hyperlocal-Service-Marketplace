package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.NotificationDTO;
import com.hyperlocalmarketplace.dto.NotificationDto;
import com.hyperlocalmarketplace.dto.NotificationResponse;
import com.hyperlocalmarketplace.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface NotificationService {
    
    // Core Legacy / Utility Methods (Preserving signatures for existing code integration)
    void sendNotification(User user, String title, String message);
    List<NotificationDto> getNotificationsForUser(String email);
    void markAsRead(Long notificationId, String email);
    List<NotificationDTO> getCustomerNotifications(String email);
    void markCustomerNotificationAsRead(String email, Long id);
    void deleteCustomerNotification(String email, Long id);

    // Rich Enterprise Integration Methods
    void sendAdvancedNotification(User user, 
                                  String title, 
                                  String message, 
                                  String type, 
                                  String channel, 
                                  String priority, 
                                  Long referenceId, 
                                  String referenceType);

    Page<NotificationResponse> getNotificationsPaginated(String email, int page, int size);
    long getUnreadCount(String email);
    void markAllNotificationsAsRead(String email);
    void clearAllNotifications(String email);
    void deleteNotificationForUser(Long id, String email);

    // Administrative Powers
    void sendNotificationToUser(Long userId, String title, String message, String type, String priority);
    void broadcastNotification(String title, String message, String type, String priority);
}
