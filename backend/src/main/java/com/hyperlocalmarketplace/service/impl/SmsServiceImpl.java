package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.SmsNotificationRequest;
import com.hyperlocalmarketplace.service.SmsService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsServiceImpl implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhoneNumber;

    private boolean isTwilioInitialized = false;

    @PostConstruct
    public void init() {
        if (accountSid == null || accountSid.trim().isEmpty() || 
            authToken == null || authToken.trim().isEmpty()) {
            log.warn("Twilio credentials are not defined. Falling back to Mock SMS logging.");
            return;
        }

        try {
            Twilio.init(accountSid, authToken);
            isTwilioInitialized = true;
            log.info("Twilio SMS SDK initialized successfully.");
        } catch (Exception ex) {
            log.error("Failed to initialize Twilio SDK: {}. Falling back to Mock SMS logging.", ex.getMessage());
        }
    }

    @Override
    public void sendSms(String phoneNumber, String messageContent) {
        log.info("Preparing to send SMS to: {}", phoneNumber);

        if (!isTwilioInitialized || fromPhoneNumber == null || fromPhoneNumber.trim().isEmpty()) {
            log.info("[MOCK SMS SENT] To: {} | Msg: {}", phoneNumber, messageContent);
            return;
        }

        try {
            Message message = Message.creator(
                    new PhoneNumber(phoneNumber),
                    new PhoneNumber(fromPhoneNumber),
                    messageContent
            ).create();
            log.info("Twilio SMS sent successfully! SID: {}", message.getSid());
        } catch (Exception ex) {
            log.error("Failed to send Twilio SMS to {}: {}", phoneNumber, ex.getMessage());
        }
    }

    @Override
    public void sendSms(SmsNotificationRequest request) {
        sendSms(request.getPhoneNumber(), request.getMessage());
    }
}
