package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.RevenueDTO;
import com.hyperlocalmarketplace.entity.Payment;
import com.hyperlocalmarketplace.enums.PaymentStatus;
import com.hyperlocalmarketplace.repository.PaymentRepository;
import com.hyperlocalmarketplace.service.RevenueService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RevenueServiceImpl implements RevenueService {

    private static final Logger log = LoggerFactory.getLogger(RevenueServiceImpl.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public RevenueDTO getRevenueReport() {
        log.info("Generating platform revenue analytics report...");
        
        List<Payment> successfulPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS || p.getStatus() == PaymentStatus.SUCCESSFUL)
                .toList();

        double totalRevenue = successfulPayments.stream()
                .mapToDouble(Payment::getAmount)
                .sum();

        // 10% platform commission
        double totalCommission = totalRevenue * 0.10;
        // 5% additional platform operational fee
        double platformFee = totalRevenue * 0.05;
        // 85% net earnings goes to providers
        double providerEarnings = totalRevenue - totalCommission - platformFee;

        log.info("Revenue Calculated - Total GTV: {}, Platform Comm: {}, Platform Fee: {}, Payouts: {}", 
                totalRevenue, totalCommission, platformFee, providerEarnings);

        return RevenueDTO.builder()
                .totalRevenue(totalRevenue)
                .totalCommission(totalCommission)
                .platformFee(platformFee)
                .providerEarnings(providerEarnings)
                .build();
    }

    @Override
    public RevenueDTO calculateEarningsForPayment(Double amount) {
        double commission = amount * 0.10;
        double platformFee = amount * 0.05;
        double providerEarnings = amount - commission - platformFee;

        return RevenueDTO.builder()
                .totalRevenue(amount)
                .totalCommission(commission)
                .platformFee(platformFee)
                .providerEarnings(providerEarnings)
                .build();
    }
}
