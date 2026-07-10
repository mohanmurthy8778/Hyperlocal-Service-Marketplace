package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.*;
import java.util.List;

public interface BookingService {
    // Original methods
    BookingResponse createBooking(String customerEmail, BookingRequest request);
    BookingResponse updateBookingStatus(String userEmail, Long bookingId, String status);
    BookingResponse cancelBooking(String userEmail, Long bookingId);
    BookingResponse completeBooking(String providerEmail, Long bookingId);
    List<BookingResponse> getBookingsForCustomer(String customerEmail);
    List<BookingResponse> getBookingsForProvider(String providerEmail);
    BookingResponse getBookingDetails(String userEmail, Long bookingId);
    List<String> getBookingTimeline(Long bookingId);

    // Provider booking lifecycle methods
    BookingResponse acceptBooking(String providerEmail, Long bookingId);
    BookingResponse rejectBooking(String providerEmail, Long bookingId);
    BookingResponse startService(String providerEmail, Long bookingId);
    BookingResponse completeBooking(String providerEmail, Long bookingId);

    // New Customer-specific Module methods
    BookingResponseDTO createCustomerBooking(String email, BookingRequestDTO request);
    BookingResponseDTO cancelCustomerBooking(String email, Long id);
    List<BookingResponseDTO> getCustomerBookingHistory(String email);
    BookingResponseDTO getCustomerBookingDetails(String email, Long id);
}
