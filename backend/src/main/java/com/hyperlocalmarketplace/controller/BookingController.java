package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Booking Module", description = "Endpoints for Creating, Updating, and Auditing Bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new booking reservation")
    public ResponseEntity<BookingResponse> createBooking(Principal principal, @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(principal.getName(), request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "View full booking details")
    public ResponseEntity<BookingResponse> getBookingDetails(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingDetails(principal.getName(), id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status (ACCEPTED, REJECTED, COMPLETED)")
    public ResponseEntity<BookingResponse> updateStatus(Principal principal, @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(principal.getName(), id, status));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking reservation")
    public ResponseEntity<BookingResponse> cancelBooking(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(principal.getName(), id));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark a booking reservation as completed")
    public ResponseEntity<BookingResponse> completeBooking(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.completeBooking(principal.getName(), id));
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "View the chronological activity log timeline of a booking")
    public ResponseEntity<List<String>> getTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingTimeline(id));
    }
}
