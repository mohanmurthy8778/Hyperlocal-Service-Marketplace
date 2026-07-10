package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.enums.BookingStatus;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.exception.BadRequestException;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.exception.UnauthorizedException;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.service.BookingManagementService;
import com.hyperlocalmarketplace.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingManagementServiceImpl implements BookingManagementService {

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public List<BookingResponseDTO> getProviderBookings(String providerEmail) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        return bookingRepository.findByProviderId(provider.getId()).stream()
                .map(this::mapToBookingResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO getBookingDetails(String providerEmail, Long bookingId) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getProvider().getId().equals(provider.getId())) {
            throw new UnauthorizedException("You are not authorized to view this booking");
        }

        return mapToBookingResponseDTO(booking);
    }

    @Override
    @Transactional
    public BookingResponseDTO acceptBooking(String providerEmail, Long bookingId) {
        return updateBookingStatus(providerEmail, bookingId, BookingStatus.ACCEPTED);
    }

    @Override
    @Transactional
    public BookingResponseDTO rejectBooking(String providerEmail, Long bookingId) {
        return updateBookingStatus(providerEmail, bookingId, BookingStatus.REJECTED);
    }

    @Override
    @Transactional
    public BookingResponseDTO startService(String providerEmail, Long bookingId) {
        return updateBookingStatus(providerEmail, bookingId, BookingStatus.IN_PROGRESS);
    }

    @Override
    @Transactional
    public BookingResponseDTO completeService(String providerEmail, Long bookingId) {
        BookingResponseDTO response = updateBookingStatus(providerEmail, bookingId, BookingStatus.COMPLETED);
        
        // Increment provider's completed jobs
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        provider.setCompletedJobs(provider.getCompletedJobs() + 1);
        providerRepository.save(provider);
        
        return response;
    }

    private BookingResponseDTO updateBookingStatus(String providerEmail, Long bookingId, BookingStatus newStatus) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getProvider().getId().equals(provider.getId())) {
            throw new UnauthorizedException("You are not authorized to edit this booking");
        }

        booking.setStatus(newStatus);
        booking = bookingRepository.save(booking);

        // Notify Customer
        notificationService.sendNotification(
                booking.getCustomer().getUser(),
                "Booking Status Updated",
                "Your booking for " + booking.getService().getName() + " has been updated to: " + newStatus
        );

        return mapToBookingResponseDTO(booking);
    }

    private BookingResponseDTO mapToBookingResponseDTO(Booking booking) {
        String customerName = booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName();
        String providerName = booking.getProvider().getFirstName() + " " + booking.getProvider().getLastName();
        
        List<Address> addresses = addressRepository.findByUserId(booking.getCustomer().getUser().getId());
        Address defaultOrFirst = addresses.stream()
                .filter(Address::isDefault)
                .findFirst()
                .orElse(addresses.isEmpty() ? null : addresses.get(0));

        AddressDTO addressDTO = null;
        if (defaultOrFirst != null) {
            addressDTO = AddressDTO.builder()
                    .id(defaultOrFirst.getId())
                    .houseNumber(defaultOrFirst.getHouseNumber())
                    .street(defaultOrFirst.getStreet())
                    .area(defaultOrFirst.getArea())
                    .city(defaultOrFirst.getCity())
                    .district(defaultOrFirst.getDistrict())
                    .state(defaultOrFirst.getState())
                    .country(defaultOrFirst.getCountry())
                    .postalCode(defaultOrFirst.getPostalCode())
                    .latitude(defaultOrFirst.getLatitude())
                    .longitude(defaultOrFirst.getLongitude())
                    .isDefault(defaultOrFirst.isDefault())
                    .build();
        }

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .bookingNumber("BK-" + String.format("%06d", booking.getId()))
                .customerId(booking.getCustomer().getId())
                .customerName(customerName)
                .providerId(booking.getProvider().getId())
                .providerName(providerName)
                .serviceId(booking.getService().getId())
                .serviceName(booking.getService().getName())
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus().name())
                .specialInstructions(booking.getNotes())
                .totalAmount(booking.getService().getStartingPrice())
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "PENDING")
                .address(addressDTO)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
