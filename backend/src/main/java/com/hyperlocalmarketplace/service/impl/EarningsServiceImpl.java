package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.EarningsDTO;
import com.hyperlocalmarketplace.dto.PaymentHistoryDTO;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.service.EarningsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EarningsServiceImpl implements EarningsService {

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public EarningsDTO getEarningsDashboard(String providerEmail) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        List<Payment> payments = paymentRepository.findByBookingProviderId(provider.getId());

        double totalEarnings = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.SUCCESSFUL)
                .mapToDouble(Payment::getAmount)
                .sum();

        double todayEarnings = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.SUCCESSFUL 
                             && p.getPaymentDate().toLocalDate().equals(LocalDate.now()))
                .mapToDouble(Payment::getAmount)
                .sum();

        double weeklyEarnings = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.SUCCESSFUL 
                             && p.getPaymentDate().isAfter(LocalDateTime.now().minusDays(7)))
                .mapToDouble(Payment::getAmount)
                .sum();

        double monthlyEarnings = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.SUCCESSFUL 
                             && p.getPaymentDate().isAfter(LocalDateTime.now().minusDays(30)))
                .mapToDouble(Payment::getAmount)
                .sum();

        double pendingPayments = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.PENDING)
                .mapToDouble(Payment::getAmount)
                .sum();

        List<Booking> bookings = bookingRepository.findByProviderId(provider.getId());
        long totalCustomers = bookings.stream()
                .map(Booking::getCustomer)
                .distinct()
                .count();

        List<PaymentHistoryDTO> history = mapToPaymentHistoryDTOList(payments);

        return EarningsDTO.builder()
                .todayEarnings(todayEarnings)
                .weeklyEarnings(weeklyEarnings)
                .monthlyEarnings(monthlyEarnings)
                .totalEarnings(totalEarnings)
                .completedJobs(provider.getCompletedJobs())
                .pendingPayments(pendingPayments)
                .averageRating(provider.getRating())
                .totalCustomers((int) totalCustomers)
                .paymentHistory(history)
                .build();
    }

    @Override
    public List<PaymentHistoryDTO> getPaymentHistory(String providerEmail) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        List<Payment> payments = paymentRepository.findByBookingProviderId(provider.getId());
        return mapToPaymentHistoryDTOList(payments);
    }

    private List<PaymentHistoryDTO> mapToPaymentHistoryDTOList(List<Payment> payments) {
        return payments.stream()
                .map(p -> PaymentHistoryDTO.builder()
                        .bookingId(p.getBooking().getId())
                        .customerName(p.getBooking().getCustomer().getFirstName() + " " + p.getBooking().getCustomer().getLastName())
                        .serviceName(p.getBooking().getService().getName())
                        .amount(p.getAmount())
                        .paymentMethod(p.getPaymentMethod())
                        .paymentStatus(p.getStatus().name())
                        .paymentDate(p.getPaymentDate())
                        .build())
                .collect(Collectors.toList());
    }
}
