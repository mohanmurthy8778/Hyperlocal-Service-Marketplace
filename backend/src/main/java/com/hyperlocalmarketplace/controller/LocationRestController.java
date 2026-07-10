package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.LocationUpdateRequest;
import com.hyperlocalmarketplace.entity.Booking;
import com.hyperlocalmarketplace.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class LocationRestController {

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/{id}/location")
    public ResponseEntity<?> updateLocation(@PathVariable Long id, @RequestBody LocationUpdateRequest update) {
        Booking booking = bookingRepository.findById(id).orElseThrow();
        booking.setProviderLatitude(update.getLatitude());
        booking.setProviderLongitude(update.getLongitude());
        bookingRepository.save(booking);
        
        // Also broadcast via STOMP if anyone is listening
        messagingTemplate.convertAndSend("/topic/booking/" + id + "/location", update);
        
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}/location")
    public ResponseEntity<?> getLocation(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id).orElseThrow();
        LocationUpdateRequest loc = new LocationUpdateRequest();
        loc.setBookingId(id);
        loc.setLatitude(booking.getProviderLatitude());
        loc.setLongitude(booking.getProviderLongitude());
        return ResponseEntity.ok(loc);
    }
}
