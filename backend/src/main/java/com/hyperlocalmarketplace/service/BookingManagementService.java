package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.BookingResponseDTO;
import java.util.List;

public interface BookingManagementService {
    List<BookingResponseDTO> getProviderBookings(String providerEmail);
    BookingResponseDTO getBookingDetails(String providerEmail, Long bookingId);
    BookingResponseDTO acceptBooking(String providerEmail, Long bookingId);
    BookingResponseDTO rejectBooking(String providerEmail, Long bookingId);
    BookingResponseDTO startService(String providerEmail, Long bookingId);
    BookingResponseDTO completeService(String providerEmail, Long bookingId);
}
