package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.service.PaymentService;
import com.hyperlocalmarketplace.service.RefundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment Management", description = "Endpoints for Razorpay order processing, signature verification, refunds, and transaction tracking")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RefundService refundService;

    @PostMapping("/create-order")
    @Operation(summary = "Initialize a new Razorpay order")
    public ResponseEntity<CreateOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment signature and unlock booking state")
    public ResponseEntity<PaymentResponse> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    @GetMapping("/history")
    @Operation(summary = "Get transaction history log for the logged-in user")
    public ResponseEntity<List<PaymentHistoryDTO>> getHistory(Principal principal) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(principal.getName()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve payment transaction details by Payment ID")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/status/{bookingId}")
    @Operation(summary = "Check payment status by Booking ID")
    public ResponseEntity<PaymentResponse> getPaymentStatusByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentStatusByBookingId(bookingId));
    }

    @PostMapping("/refund/{paymentId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Approve and process a refund")
    public ResponseEntity<RefundResponse> approveRefund(@PathVariable Long paymentId) {
        return ResponseEntity.ok(refundService.approveRefund(paymentId));
    }

    @PostMapping("/refund/request")
    @Operation(summary = "Customer: Request a refund for a successful booking")
    public ResponseEntity<RefundResponse> requestRefund(@Valid @RequestBody RefundRequest request) {
        return ResponseEntity.ok(refundService.requestRefund(request));
    }

    @PostMapping("/refund/{paymentId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Reject a refund request")
    public ResponseEntity<RefundResponse> rejectRefund(@PathVariable Long paymentId) {
        return ResponseEntity.ok(refundService.rejectRefund(paymentId));
    }

    @GetMapping("/refunds")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Get all processed or requested refunds")
    public ResponseEntity<List<RefundResponse>> getRefunds() {
        return ResponseEntity.ok(refundService.getAllRefunds());
    }
}
