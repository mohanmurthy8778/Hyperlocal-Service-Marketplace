package com.hyperlocalmarketplace.service.impl;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.hyperlocalmarketplace.dto.PushNotificationRequest;
import com.hyperlocalmarketplace.entity.User;
import com.hyperlocalmarketplace.entity.UserDeviceToken;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.repository.UserDeviceTokenRepository;
import com.hyperlocalmarketplace.repository.UserRepository;
import com.hyperlocalmarketplace.service.PushNotificationService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Service
public class PushNotificationServiceImpl implements PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationServiceImpl.class);

    @Autowired
    private UserDeviceTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${firebase.config.path:}")
    private String firebaseConfigPath;

    private boolean isFirebaseInitialized = false;

    @PostConstruct
    public void init() {
        if (firebaseConfigPath == null || firebaseConfigPath.trim().isEmpty()) {
            log.warn("FCM config path 'firebase.config.path' is not defined. Falling back to Mock Push Notification execution.");
            return;
        }

        try (InputStream serviceAccount = new FileInputStream(firebaseConfigPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
            isFirebaseInitialized = true;
            log.info("Firebase FCM Admin SDK initialized successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize Firebase SDK from path '{}': {}. Falling back to Mock Push Notifications.", 
                    firebaseConfigPath, e.getMessage());
        }
    }

    @Override
    @Transactional
    public void registerToken(String email, String token) {
        log.info("Registering FCM device token for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Optional<UserDeviceToken> existingToken = tokenRepository.findByToken(token);
        if (existingToken.isPresent()) {
            UserDeviceToken deviceToken = existingToken.get();
            if (!deviceToken.getUser().getId().equals(user.getId())) {
                deviceToken.setUser(user); // Reassign if token is now on another account
                tokenRepository.save(deviceToken);
            }
            log.info("FCM Token already registered for user.");
        } else {
            UserDeviceToken deviceToken = UserDeviceToken.builder()
                    .user(user)
                    .token(token)
                    .build();
            tokenRepository.save(deviceToken);
            log.info("Successfully registered new FCM device token for user: {}", email);
        }
    }

    @Override
    @Transactional
    public void removeToken(String email, String token) {
        log.info("Removing FCM device token for user: {}", email);
        Optional<UserDeviceToken> deviceToken = tokenRepository.findByToken(token);
        if (deviceToken.isPresent()) {
            if (!deviceToken.get().getUser().getEmail().equals(email)) {
                log.warn("FCM Token deletion unauthorized: Token owner mismatch.");
                return;
            }
            tokenRepository.delete(deviceToken.get());
            log.info("Successfully removed FCM token.");
        } else {
            log.warn("FCM Token not found, skipping deletion.");
        }
    }

    @Override
    public void sendPushNotification(PushNotificationRequest request) {
        log.info("Dispatching custom push notification request to userId: {}", request.getUserId());
        List<UserDeviceToken> userTokens = tokenRepository.findByUserId(request.getUserId());

        if (userTokens.isEmpty()) {
            log.warn("No registered FCM tokens found for userId: {}. Notification payload stored locally only.", request.getUserId());
            return;
        }

        for (UserDeviceToken deviceToken : userTokens) {
            sendFcmMessage(deviceToken.getToken(), request.getTitle(), request.getMessage(), request.getData());
        }
    }

    @Override
    public void sendPushNotificationToUser(Long userId, String title, String message) {
        log.info("Dispatching automated push alert to userId: {}", userId);
        List<UserDeviceToken> userTokens = tokenRepository.findByUserId(userId);

        if (userTokens.isEmpty()) {
            log.warn("No registered FCM tokens found for userId: {}. Storing push locally.", userId);
            return;
        }

        for (UserDeviceToken deviceToken : userTokens) {
            sendFcmMessage(deviceToken.getToken(), title, message, null);
        }
    }

    private void sendFcmMessage(String registrationToken, String title, String messageContent, java.util.Map<String, String> data) {
        if (!isFirebaseInitialized) {
            log.info("[MOCK PUSH SENT] Token: {} | Title: {} | Body: {} | Data: {}", 
                    registrationToken, title, messageContent, data);
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(messageContent)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(registrationToken)
                    .setNotification(notification);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("FCM push successfully delivered! Response: {}", response);
        } catch (Exception ex) {
            log.error("Failed to send FCM push to token {}: {}", registrationToken, ex.getMessage());
        }
    }
}
