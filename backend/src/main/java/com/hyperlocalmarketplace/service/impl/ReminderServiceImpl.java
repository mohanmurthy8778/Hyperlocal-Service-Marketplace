package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.entity.Booking;
import com.hyperlocalmarketplace.enums.BookingStatus;
import com.hyperlocalmarketplace.repository.BookingRepository;
import com.hyperlocalmarketplace.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReminderServiceImpl implements ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderServiceImpl.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PushNotificationService pushNotificationService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Executes every 15 minutes to run automatic service reminders.
     */
    @Override
    @Scheduled(cron = "0 */15 * * * *")
    public void processUpcomingServiceReminders() {
        log.info("Executing scheduled service reminders checker...");
        try {
            List<Booking> bookings = bookingRepository.findAll();
            LocalDateTime now = LocalDateTime.now();

            for (Booking booking : bookings) {
                if (booking.getStatus() != BookingStatus.ACCEPTED) {
                    continue;
                }

                LocalDateTime appointmentTime = booking.getBookingDate().atTime(booking.getBookingTime());
                if (appointmentTime.isBefore(now)) {
                    continue;
                }

                long minutesRemaining = Duration.between(now, appointmentTime).toMinutes();

                // 24 Hours Reminder (1430 to 1445 minutes)
                if (minutesRemaining >= 1425 && minutesRemaining <= 1455) {
                    sendServiceReminder(booking, "24 Hours");
                }
                // 2 Hours Reminder (110 to 125 minutes)
                else if (minutesRemaining >= 105 && minutesRemaining <= 135) {
                    sendServiceReminder(booking, "2 Hours");
                }
                // 30 Minutes Reminder (20 to 35 minutes)
                else if (minutesRemaining >= 20 && minutesRemaining <= 35) {
                    sendServiceReminder(booking, "30 Minutes");
                }
            }
        } catch (Exception ex) {
            log.error("Error occurred while processing service reminders: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Executes every hour to remind users about pending bookings or payments.
     */
    @Override
    @Scheduled(cron = "0 0 * * * *")
    public void processPaymentReminders() {
        log.info("Executing scheduled payment reminders checker...");
        try {
            List<Booking> bookings = bookingRepository.findAll();
            for (Booking booking : bookings) {
                if (booking.getStatus() == BookingStatus.PENDING) {
                    // Send notification to customer to complete payment
                    String customerEmail = booking.getCustomer().getUser().getEmail();
                    String title = "Action Required: Complete Payment for Booking #" + booking.getId();
                    String msg = "Your booking for " + booking.getService().getName() + " is currently pending. Please complete your payment to secure your appointment.";
                    
                    notificationService.sendNotification(booking.getCustomer().getUser(), title, msg);
                    log.info("Dispatched pending payment alert to customer for booking #{}", booking.getId());
                }
            }
        } catch (Exception ex) {
            log.error("Error occurred while processing payment reminders: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Executes once a day to remind completed bookings to write reviews.
     */
    @Override
    @Scheduled(cron = "0 0 10 * * *") // Runs daily at 10:00 AM
    public void processReviewReminders() {
        log.info("Executing scheduled review reminders checker...");
        try {
            List<Booking> bookings = bookingRepository.findAll();
            for (Booking booking : bookings) {
                if (booking.getStatus() == BookingStatus.COMPLETED) {
                    // Send a review reminder
                    String title = "How was your experience?";
                    String msg = "Your booking with " + booking.getProvider().getFirstName() + " for " + booking.getService().getName() + " was completed. Please leave a rating and share your review!";
                    
                    notificationService.sendNotification(booking.getCustomer().getUser(), title, msg);
                    log.info("Dispatched review solicitation to customer for booking #{}", booking.getId());
                }
            }
        } catch (Exception ex) {
            log.error("Error occurred while processing review reminders: {}", ex.getMessage(), ex);
        }
    }

    private void sendServiceReminder(Booking booking, String timeRemainingLabel) {
        String serviceName = booking.getService().getName();
        String providerName = booking.getProvider().getFirstName() + " " + booking.getProvider().getLastName();
        String customerEmail = booking.getCustomer().getUser().getEmail();
        String customerName = booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName();
        String customerPhone = booking.getCustomer().getPhone();
        String address = booking.getNotes() != null ? booking.getNotes() : "Your registered service location";
        String appointmentTimeStr = booking.getBookingDate().toString() + " " + booking.getBookingTime().toString();

        String notificationTitle = "Service Reminder: " + timeRemainingLabel + " to go!";
        String notificationMsg = "Reminder: Your service appointment for " + serviceName + " with " + providerName + " starts in " + timeRemainingLabel + " (" + appointmentTimeStr + ").";

        // 1. In-App Notification Log
        notificationService.sendNotification(booking.getCustomer().getUser(), notificationTitle, notificationMsg);

        // 2. Email Delivery
        emailService.sendServiceReminderEmail(customerEmail, customerName, serviceName, providerName, address, appointmentTimeStr);

        // 3. Push delivery (FCM)
        pushNotificationService.sendPushNotificationToUser(booking.getCustomer().getUser().getId(), notificationTitle, notificationMsg);

        // 4. SMS Delivery
        if (customerPhone != null && !customerPhone.trim().isEmpty()) {
            smsService.sendSms(customerPhone, notificationMsg);
        }

        log.info("Dispatched standard service reminder ({}) for Booking #{} to Customer and Provider.", timeRemainingLabel, booking.getId());
    }
}
