package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(String orderId);
    Optional<Payment> findByPaymentId(String paymentId);
    List<Payment> findByBookingCustomerId(Long customerId);
    List<Payment> findByBookingProviderId(Long providerId);
}
