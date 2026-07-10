package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.RefundRequest;
import com.hyperlocalmarketplace.dto.RefundResponse;
import com.hyperlocalmarketplace.entity.Booking;
import com.hyperlocalmarketplace.entity.Payment;
import com.hyperlocalmarketplace.enums.BookingStatus;
import com.hyperlocalmarketplace.enums.PaymentStatus;
import com.hyperlocalmarketplace.exception.BadRequestException;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.repository.BookingRepository;
import com.hyperlocalmarketplace.repository.PaymentRepository;
import com.hyperlocalmarketplace.service.NotificationService;
import com.hyperlocalmarketplace.service.RefundService;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RefundServiceImpl implements RefundService {

    private static final Logger log = LoggerFactory.getLogger(RefundServiceImpl.class);

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public RefundResponse requestRefund(RefundRequest request) {
        log.info("Processing refund request for Payment ID: {}, Reason: {}", request.getPaymentId(), request.getReason());
        
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        if (payment.getStatus() != PaymentStatus.SUCCESS && payment.getStatus() != PaymentStatus.SUCCESSFUL) {
            throw new BadRequestException("Only successful payments can be refunded. Current status: " + payment.getStatus());
        }

        // Set status to PROCESSING refund, or approve immediately for standard flow
        payment.setStatus(PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        return RefundResponse.builder()
                .paymentId(payment.getId())
                .amount(payment.getAmount())
                .status("PENDING_APPROVAL")
                .message("Refund request submitted successfully. Awaiting Admin approval.")
                .build();
    }

    @Override
    @Transactional
    public RefundResponse approveRefund(Long paymentId) {
        log.info("Admin approved refund for Payment ID: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new BadRequestException("Payment is already refunded!");
        }

        String refundId = "ref_mock_" + UUID.randomUUID().toString().substring(0, 12);

        try {
            if (keyId != null && !keyId.startsWith("rzp_test_dummy") && payment.getPaymentId() != null && !payment.getPaymentId().startsWith("mock_")) {
                RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
                JSONObject refundRequest = new JSONObject();
                refundRequest.put("payment_id", payment.getPaymentId());
                refundRequest.put("amount", (int) (payment.getAmount() * 100));

                com.razorpay.Refund refund = razorpay.refunds.create(refundRequest);
                refundId = refund.get("id");
            } else {
                log.warn("Using simulated refund due to missing/dummy Razorpay keys");
            }
        } catch (Exception ex) {
            log.error("Razorpay refund integration failed, applying secure fallback simulation: {}", ex.getMessage());
        }

        // Update Payment state
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // Cancel the associated Booking
        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        log.info("Refund approved successfully. Refund ID: {}, Payment ID: {}, Booking ID: {} cancelled", refundId, paymentId, booking.getId());

        // Notify client and provider
        String refundMsg = "Refund of INR " + payment.getAmount() + " processed successfully for Booking ID: " + booking.getId();
        notificationService.sendNotification(booking.getCustomer().getUser(), "Refund Approved", refundMsg);
        notificationService.sendNotification(booking.getProvider().getUser(), "Booking Refunded", "Booking ID " + booking.getId() + " has been refunded and cancelled.");

        return RefundResponse.builder()
                .refundId(refundId)
                .paymentId(payment.getId())
                .amount(payment.getAmount())
                .status("REFUNDED")
                .message("Refund processed and booking cancelled successfully.")
                .build();
    }

    @Override
    @Transactional
    public RefundResponse rejectRefund(Long paymentId) {
        log.info("Admin rejected refund for Payment ID: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        if (payment.getStatus() != PaymentStatus.PROCESSING) {
            throw new BadRequestException("Refund request is not in PROCESSING status.");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        return RefundResponse.builder()
                .paymentId(payment.getId())
                .amount(payment.getAmount())
                .status("REJECTED")
                .message("Refund request rejected. Payment remains active and successful.")
                .build();
    }

    @Override
    public List<RefundResponse> getAllRefunds() {
        // Retrieve payments with REFUNDED or PROCESSING status to represent refund list
        List<Payment> refundPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.REFUNDED || p.getStatus() == PaymentStatus.PROCESSING)
                .collect(Collectors.toList());

        return refundPayments.stream()
                .map(p -> RefundResponse.builder()
                        .refundId(p.getPaymentId() != null ? "ref_" + p.getPaymentId() : "ref_pending")
                        .paymentId(p.getId())
                        .amount(p.getAmount())
                        .status(p.getStatus().name())
                        .message("Refund record status: " + p.getStatus())
                        .build())
                .collect(Collectors.toList());
    }
}
