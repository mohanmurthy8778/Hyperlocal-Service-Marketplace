package com.hyperlocalmarketplace.service;

import java.io.ByteArrayInputStream;

public interface EmailService {
    void sendInvoiceEmail(String toEmail, String customerName, String invoiceNumber, ByteArrayInputStream pdfStream);
    void sendHtmlEmail(String toEmail, String subject, String htmlContent);
    void sendWelcomeEmail(String toEmail, String userName);
    void sendBookingConfirmationEmail(String toEmail, String userName, Long bookingId, String providerName, String serviceName, String date, String time);
    void sendBookingCancellationEmail(String toEmail, String userName, Long bookingId, String serviceName, String reason);
    void sendPaymentSuccessEmail(String toEmail, String userName, Double amount, String transactionId, Long bookingId, String invoiceNum);
    void sendServiceReminderEmail(String toEmail, String userName, String serviceName, String providerName, String address, String time);
    void sendPasswordResetEmail(String toEmail, String resetLink);
}
