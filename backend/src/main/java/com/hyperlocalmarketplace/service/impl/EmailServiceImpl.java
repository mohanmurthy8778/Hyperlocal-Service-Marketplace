package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final String BRAND_COLOR = "#0f172a"; // Slate/Navy Blue
    private static final String ACCENT_COLOR = "#c29632"; // Elegant Gold
    private static final String BG_COLOR = "#f8fafc"; // Light Gray

    @Override
    public void sendInvoiceEmail(String toEmail, String customerName, String invoiceNumber, ByteArrayInputStream pdfStream) {
        log.info("Preparing to send invoice email to: {}", toEmail);
        try {
            if (mailSender == null) {
                log.warn("JavaMailSender is not configured. Simulating HTML invoice email to: {}", toEmail);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Your Booking Invoice - ServiceHub");

            String htmlBody = getEmailTemplate(
                "Invoice Issued",
                "Dear " + customerName + ",<br/><br/>" +
                "Thank you for choosing ServiceHub! Your payment was verified successfully and your booking is confirmed. Your invoice <strong>" + invoiceNumber + "</strong> has been generated and is attached to this email as a PDF document."
            );

            helper.setText(htmlBody, true);

            byte[] pdfBytes = pdfStream.readAllBytes();
            helper.addAttachment("Invoice_" + invoiceNumber + ".pdf", new ByteArrayResource(pdfBytes));

            mailSender.send(message);
            log.info("Successfully sent invoice email to {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send invoice email to {}: {}", toEmail, ex.getMessage(), ex);
        }
    }

    @Override
    public void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        log.info("Sending HTML email to: {} with subject: {}", toEmail, subject);
        try {
            if (mailSender == null) {
                log.warn("JavaMailSender is not configured. Simulating HTML Email. To: {} | Subject: {}", toEmail, subject);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("HTML email sent successfully to {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send HTML email to {}: {}", toEmail, ex.getMessage(), ex);
        }
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String userName) {
        String subject = "Welcome to ServiceHub - Hyperlocal Service Marketplace!";
        String content = "<h3>Hello " + userName + ",</h3>" +
                "<p>Welcome to <strong>ServiceHub</strong>! We are thrilled to have you join our hyperlocal community.</p>" +
                "<p>Whether you're looking for professional services at your doorstep, or offering specialized services, ServiceHub makes it easy, secure, and instant.</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "  <a href='#' style='background-color:" + BRAND_COLOR + "; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;'>Explore Local Services</a>" +
                "</div>" +
                "<p>If you have any questions, our support team is always here to help.</p>";
        
        String html = getEmailTemplate("Welcome to ServiceHub!", content);
        sendHtmlEmail(toEmail, subject, html);
    }

    @Override
    public void sendBookingConfirmationEmail(String toEmail, String userName, Long bookingId, String providerName, String serviceName, String date, String time) {
        String subject = "Booking Confirmed - Booking #" + bookingId;
        String content = "<h3>Hello " + userName + ",</h3>" +
                "<p>We're excited to let you know that your booking has been successfully confirmed!</p>" +
                "<div style='background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid " + ACCENT_COLOR + ";'>" +
                "  <p style='margin: 4px 0;'><strong>Booking ID:</strong> #" + bookingId + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Service:</strong> " + serviceName + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Provider:</strong> " + providerName + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Date & Time:</strong> " + date + " at " + time + "</p>" +
                "</div>" +
                "<p>Please ensure you are available at your address at the scheduled time. Our service provider will reach out to you if needed.</p>";

        String html = getEmailTemplate("Booking Confirmed", content);
        sendHtmlEmail(toEmail, subject, html);
    }

    @Override
    public void sendBookingCancellationEmail(String toEmail, String userName, Long bookingId, String serviceName, String reason) {
        String subject = "Booking Cancelled - Booking #" + bookingId;
        String content = "<h3>Hello " + userName + ",</h3>" +
                "<p>We regret to inform you that your booking has been cancelled.</p>" +
                "<div style='background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; color: #991b1b;'>" +
                "  <p style='margin: 4px 0;'><strong>Booking ID:</strong> #" + bookingId + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Service:</strong> " + serviceName + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Reason for Cancellation:</strong> " + (reason != null ? reason : "Not specified") + "</p>" +
                "</div>" +
                "<p>If a payment was made, your refund request has been automatically generated and is currently being processed by our admin.</p>";

        String html = getEmailTemplate("Booking Cancelled", content);
        sendHtmlEmail(toEmail, subject, html);
    }

    @Override
    public void sendPaymentSuccessEmail(String toEmail, String userName, Double amount, String transactionId, Long bookingId, String invoiceNum) {
        String subject = "Payment Successful - Transaction #" + transactionId;
        String content = "<h3>Hello " + userName + ",</h3>" +
                "<p>Thank you for your payment. Your transaction has been processed successfully.</p>" +
                "<div style='background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid " + BRAND_COLOR + ";'>" +
                "  <p style='margin: 4px 0;'><strong>Transaction ID:</strong> " + transactionId + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Booking ID:</strong> #" + bookingId + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Invoice Number:</strong> " + invoiceNum + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Amount Paid:</strong> INR " + String.format("%.2f", amount) + "</p>" +
                "</div>" +
                "<p>Your professional invoice is attached. You can also view or download it directly from your dashboard anytime.</p>";

        String html = getEmailTemplate("Payment Received", content);
        sendHtmlEmail(toEmail, subject, html);
    }

    @Override
    public void sendServiceReminderEmail(String toEmail, String userName, String serviceName, String providerName, String address, String time) {
        String subject = "Reminder: Upcoming Service Scheduled Soon!";
        String content = "<h3>Hello " + userName + ",</h3>" +
                "<p>This is a friendly reminder that you have an upcoming service booking scheduled soon!</p>" +
                "<div style='background-color: #fffbeb; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;'>" +
                "  <p style='margin: 4px 0;'><strong>Service:</strong> " + serviceName + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Provider:</strong> " + providerName + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Scheduled Time:</strong> " + time + "</p>" +
                "  <p style='margin: 4px 0;'><strong>Service Location:</strong> " + address + "</p>" +
                "</div>" +
                "<p>If you need to change your appointment or contact the provider, please log in to the ServiceHub portal.</p>";

        String html = getEmailTemplate("Upcoming Service Reminder", content);
        sendHtmlEmail(toEmail, subject, html);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String subject = "Password Reset Request - ServiceHub";
        String content = "<h3>Hello,</h3>" +
                "<p>We received a request to reset your password for your ServiceHub account. If you did not make this request, you can safely ignore this email.</p>" +
                "<p>To proceed with your password reset, click on the button below:</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "  <a href='" + resetLink + "' style='background-color:" + ACCENT_COLOR + "; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;'>Reset My Password</a>" +
                "</div>" +
                "<p>Or copy and paste this link in your web browser:</p>" +
                "<p style='word-break: break-all; font-size: 11px; color: #64748b;'>" + resetLink + "</p>";

        String html = getEmailTemplate("Reset Your Password", content);
        sendHtmlEmail(toEmail, subject, html);
    }

    private String getEmailTemplate(String heading, String innerContent) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>%s</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: %s; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background-color: %s; padding: 30px 40px; text-align: left; border-bottom: 3px solid %s; }
            .logo { font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
            .logo span { color: %s; }
            .heading-banner { padding: 25px 40px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
            .heading-banner h2 { margin: 0; font-size: 20px; color: %s; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .content { padding: 40px; color: #334155; font-size: 15px; line-height: 1.6; }
            .footer { background-color: #0f172a; padding: 25px 40px; text-align: center; color: #94a3b8; font-size: 12px; }
            .footer a { color: %s; text-decoration: none; font-weight: 500; }
            p { margin: 0 0 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">Near<span>by</span></h1>
            </div>
            <div class="heading-banner">
              <h2>%s</h2>
            </div>
            <div class="content">
              %s
            </div>
            <div class="footer">
              <p>&copy; 2026 ServiceHub Inc. All rights reserved.</p>
              <p>For inquiries, contact us at <a href="mailto:support@servicehub.com">support@servicehub.com</a></p>
              <p style="font-size:10px; margin-top:10px; color:#64748b;">This email was automatically dispatched by ServiceHub Hyperlocal Marketplace.</p>
            </div>
          </div>
        </body>
        </html>
        """.formatted(heading, BG_COLOR, BRAND_COLOR, ACCENT_COLOR, ACCENT_COLOR, BRAND_COLOR, ACCENT_COLOR, heading, innerContent);
    }
}
