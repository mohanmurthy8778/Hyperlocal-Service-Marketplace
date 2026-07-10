package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.*;
import java.util.List;

public interface PaymentService {
    CreateOrderResponse createOrder(CreateOrderRequest request);
    PaymentResponse verifyPayment(PaymentVerificationRequest request);
    List<PaymentHistoryDTO> getPaymentHistory(String email);
    PaymentResponse getPaymentById(Long id);
    PaymentResponse getPaymentStatusByBookingId(Long bookingId);
    List<PaymentResponse> getAllPaymentsForAdmin();
}
