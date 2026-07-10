package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.LocationUpdateRequest;
import com.hyperlocalmarketplace.entity.Booking;
import com.hyperlocalmarketplace.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

@Controller
public class LocationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private BookingRepository bookingRepository;

    @MessageMapping("/track-provider")
    @Transactional
    public void trackProvider(LocationUpdateRequest update) {
        // Save to DB
        Booking booking = bookingRepository.findById(update.getBookingId()).orElse(null);
        if (booking != null) {
            booking.setProviderLatitude(update.getLatitude());
            booking.setProviderLongitude(update.getLongitude());
            bookingRepository.save(booking);
        }
        
        // Broadcast to specific customer's topic for this booking
        messagingTemplate.convertAndSend("/topic/booking/" + update.getBookingId() + "/location", update);
    }
}
