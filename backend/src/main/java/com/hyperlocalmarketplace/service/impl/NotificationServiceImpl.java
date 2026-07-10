package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.NotificationDTO;
import com.hyperlocalmarketplace.dto.NotificationDto;
import com.hyperlocalmarketplace.dto.NotificationResponse;
import com.hyperlocalmarketplace.entity.Notification;
import com.hyperlocalmarketplace.entity.User;
import com.hyperlocalmarketplace.enums.NotificationChannel;
import com.hyperlocalmarketplace.enums.NotificationPriority;
import com.hyperlocalmarketplace.enums.NotificationStatus;
import com.hyperlocalmarketplace.enums.NotificationType;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.exception.UnauthorizedException;
import com.hyperlocalmarketplace.repository.NotificationRepository;
import com.hyperlocalmarketplace.repository.UserRepository;
import com.hyperlocalmarketplace.service.EmailService;
import com.hyperlocalmarketplace.service.NotificationService;
import com.hyperlocalmarketplace.service.PushNotificationService;
import com.hyperlocalmarketplace.service.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PushNotificationService pushNotificationService;

    @Autowired
    private SmsService smsService;

    @Override
    @Transactional
    public void sendNotification(User user, String title, String message) {
        log.info("Creating notification alert for user: {}", user.getEmail());
        sendAdvancedNotification(
                user,
                title,
                message,
                "SYSTEM",
                "IN_APP",
                "MEDIUM",
                null,
                null
        );
    }

    @Override
    public List<NotificationDto> getNotificationsForUser(String email) {
        log.info("Fetching notifications for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toLegacyDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String email) {
        log.info("Marking notification #{} as read for user: {}", notificationId, email);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new UnauthorizedException("You are not authorized to access this notification");
        }

        notification.setRead(true);
        notification.setStatus(NotificationStatus.READ);
        notificationRepository.save(notification);
        log.info("Notification #{} marked as read.", notificationId);
    }

    @Override
    public List<NotificationDTO> getCustomerNotifications(String email) {
        log.info("Fetching customer-module notifications for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toNotificationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markCustomerNotificationAsRead(String email, Long id) {
        markAsRead(id, email);
    }

    @Override
    @Transactional
    public void deleteCustomerNotification(String email, Long id) {
        log.info("Deleting customer notification #{} for user: {}", id, email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        if (!notification.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new UnauthorizedException("You are not authorized to delete this notification");
        }

        notificationRepository.delete(notification);
        log.info("Notification #{} successfully deleted from database.", id);
    }

    @Override
    @Transactional
    public void sendAdvancedNotification(User user, 
                                         String title, 
                                         String message, 
                                         String type, 
                                         String channel, 
                                         String priority, 
                                         Long referenceId, 
                                         String referenceType) {
        
        log.info("Processing advanced notification trigger for user: {} | Title: {} | Channel: {}", 
                user.getEmail(), title, channel);

        NotificationType nType = parseEnum(NotificationType.class, type, NotificationType.SYSTEM);
        NotificationChannel nChannel = parseEnum(NotificationChannel.class, channel, NotificationChannel.IN_APP);
        NotificationPriority nPriority = parseEnum(NotificationPriority.class, priority, NotificationPriority.MEDIUM);

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(nType)
                .channel(nChannel)
                .priority(nPriority)
                .status(NotificationStatus.PENDING)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();

        // Save first to obtain Entity ID and persist record
        notification = notificationRepository.save(notification);
        log.info("Notification record created in DB. ID: {}", notification.getId());

        try {
            switch (nChannel) {
                case EMAIL:
                    emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName());
                    notification.setStatus(NotificationStatus.SENT);
                    log.info("Email alert dispatched to {}", user.getEmail());
                    break;

                case PUSH:
                    pushNotificationService.sendPushNotificationToUser(user.getId(), title, message);
                    notification.setStatus(NotificationStatus.SENT);
                    log.info("Push alert dispatched to user ID {}", user.getId());
                    break;

                case SMS:
                    if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
                        smsService.sendSms(user.getPhone(), message);
                        notification.setStatus(NotificationStatus.SENT);
                        log.info("SMS alert dispatched to {}", user.getPhone());
                    } else {
                        notification.setStatus(NotificationStatus.FAILED);
                        log.warn("Failed to dispatch SMS: User phone number is empty.");
                    }
                    break;

                case IN_APP:
                default:
                    notification.setStatus(NotificationStatus.SENT);
                    log.info("In-App alert stored for active retrieval.");
                    break;
            }
        } catch (Exception ex) {
            notification.setStatus(NotificationStatus.FAILED);
            log.error("Failed to route notification through channel {}: {}", nChannel, ex.getMessage());
        }

        notificationRepository.save(notification);
    }

    @Override
    public Page<NotificationResponse> getNotificationsPaginated(String email, int page, int size) {
        log.info("Retrieving page {} (size {}) of notifications for user: {}", page, size, email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> pagedResults = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return pagedResults.map(this::toResponse);
    }

    @Override
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        log.info("User {} has {} unread notifications.", email, count);
        return count;
    }

    @Override
    @Transactional
    public void markAllNotificationsAsRead(String email) {
        log.info("Marking all notifications as read for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        notificationRepository.markAllAsReadForUser(user.getId());
        log.info("All notifications marked as read for user ID {}", user.getId());
    }

    @Override
    @Transactional
    public void clearAllNotifications(String email) {
        log.info("Clearing all notifications for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        notificationRepository.deleteAllForUser(user.getId());
        log.info("All notifications cleared from DB for user ID {}", user.getId());
    }

    @Override
    @Transactional
    public void deleteNotificationForUser(Long id, String email) {
        deleteCustomerNotification(email, id);
    }

    @Override
    @Transactional
    public void sendNotificationToUser(Long userId, String title, String message, String type, String priority) {
        log.info("Admin command: Sending custom alert to user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found with ID: " + userId));

        sendAdvancedNotification(
                user,
                title,
                message,
                type,
                "IN_APP",
                priority,
                null,
                null
        );
    }

    @Override
    @Transactional
    public void broadcastNotification(String title, String message, String type, String priority) {
        log.info("Admin command: Broadcasting notification alert to ALL registered users.");
        List<User> allUsers = userRepository.findAll();
        
        for (User user : allUsers) {
            try {
                sendAdvancedNotification(
                        user,
                        title,
                        message,
                        type,
                        "IN_APP",
                        priority,
                        null,
                        null
                );
            } catch (Exception ex) {
                log.error("Failed to dispatch broadcast to user {}: {}", user.getEmail(), ex.getMessage());
            }
        }
        log.info("Broadcast complete. Dispatched to {} users.", allUsers.size());
    }

    // Helper conversion mappings
    private NotificationDto toLegacyDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : "SYSTEM")
                .channel(n.getChannel() != null ? n.getChannel().name() : "IN_APP")
                .status(n.getStatus() != null ? n.getStatus().name() : "SENT")
                .priority(n.getPriority() != null ? n.getPriority().name() : "MEDIUM")
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }

    private NotificationDTO toNotificationDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : "SYSTEM")
                .channel(n.getChannel() != null ? n.getChannel().name() : "IN_APP")
                .status(n.getStatus() != null ? n.getStatus().name() : "SENT")
                .priority(n.getPriority() != null ? n.getPriority().name() : "MEDIUM")
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : "SYSTEM")
                .channel(n.getChannel() != null ? n.getChannel().name() : "IN_APP")
                .status(n.getStatus() != null ? n.getStatus().name() : "SENT")
                .priority(n.getPriority() != null ? n.getPriority().name() : "MEDIUM")
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, E defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Enum.valueOf(enumClass, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid enum value '{}' for {}. Defaulting to {}", value, enumClass.getSimpleName(), defaultValue);
            return defaultValue;
        }
    }
}
