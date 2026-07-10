package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.model.Booking;
import com.hyperlocalmarketplace.service.BookingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    @Test
    void testCreateBooking_Success() {
        Booking mockBooking = new Booking();
        mockBooking.setId(100L);
        when(bookingService.createBooking(any())).thenReturn(mockBooking);

        ResponseEntity<Booking> response = bookingController.createBooking(new Booking());

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(100L, response.getBody().getId());
        verify(bookingService, times(1)).createBooking(any());
    }

    @Test
    void testCancelBooking_Success() {
        when(bookingService.cancelBooking(100L)).thenReturn(true);

        ResponseEntity<Void> response = bookingController.cancelBooking(100L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(bookingService, times(1)).cancelBooking(100L);
    }
}
