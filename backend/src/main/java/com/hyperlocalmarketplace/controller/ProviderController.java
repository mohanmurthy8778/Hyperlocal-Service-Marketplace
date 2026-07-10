package com.hyperlocalmarketplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/provider")
@Tag(name = "Service Provider Module", description = "Endpoints for Profile, Listings, Bookings, Earnings, and Notifications")
public class ProviderController {

    @Autowired
    private ProviderService providerService;

    @Autowired
    private ServiceManagementService serviceManagementService;

    @Autowired
    private BookingManagementService bookingManagementService;

    @Autowired
    private EarningsService earningsService;

    @Autowired
    private NotificationService notificationService;

    // --- PROFILE ---

    @GetMapping("/profile")
    @Operation(summary = "View logged-in provider's profile details")
    public ResponseEntity<ProviderProfileDTO> getProfile(Principal principal) {
        return ResponseEntity.ok(providerService.getProviderProfile(principal.getName()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update provider's profile, experience, skills, working hours, and location")
    public ResponseEntity<ProviderProfileDTO> updateProfile(Principal principal, @Valid @RequestBody UpdateProviderDTO request) {
        return ResponseEntity.ok(providerService.updateProviderProfile(principal.getName(), request));
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile picture")
    public ResponseEntity<Map<String, String>> uploadImage(Principal principal, @RequestParam("file") MultipartFile file) {
        String url = providerService.uploadProfileImage(principal.getName(), file);
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", url);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload ID/license proof document for verification")
    public ResponseEntity<Map<String, String>> uploadDoc(
            Principal principal,
            @RequestParam("name") String docName,
            @RequestParam("type") String docType,
            @RequestParam("file") MultipartFile file) {
        providerService.uploadProviderDocument(principal.getName(), docName, docType, file);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Document uploaded successfully for admin processing");
        return ResponseEntity.ok(response);
    }

    // --- SERVICES ---

    @PostMapping(value = "/services", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new service listing")
    public ResponseEntity<ServiceResponseDTO> addService(
            Principal principal,
            @RequestPart("service") String serviceJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            ServiceRequestDTO request = new ObjectMapper().readValue(serviceJson, ServiceRequestDTO.class);
            return ResponseEntity.ok(serviceManagementService.addService(principal.getName(), request, image));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Service Request JSON: " + e.getMessage());
        }
    }

    @GetMapping("/services")
    @Operation(summary = "View provider's service listings")
    public ResponseEntity<List<ServiceResponseDTO>> getServices(Principal principal) {
        return ResponseEntity.ok(serviceManagementService.getProviderServices(principal.getName()));
    }

    @GetMapping("/services/{id}")
    @Operation(summary = "View specific service listing details")
    public ResponseEntity<ServiceResponseDTO> getServiceById(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(serviceManagementService.getServiceById(principal.getName(), id));
    }

    @PutMapping(value = "/services/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Modify an existing service listing")
    public ResponseEntity<ServiceResponseDTO> updateService(
            Principal principal,
            @PathVariable Long id,
            @RequestPart("service") String serviceJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            ServiceRequestDTO request = new ObjectMapper().readValue(serviceJson, ServiceRequestDTO.class);
            return ResponseEntity.ok(serviceManagementService.updateService(principal.getName(), id, request, image));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Service Request JSON: " + e.getMessage());
        }
    }

    @DeleteMapping("/services/{id}")
    @Operation(summary = "Delete a service listing")
    public ResponseEntity<Map<String, String>> deleteService(Principal principal, @PathVariable Long id) {
        serviceManagementService.deleteService(principal.getName(), id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Service deleted successfully");
        return ResponseEntity.ok(response);
    }

    // --- BOOKINGS ---

    @GetMapping("/bookings")
    @Operation(summary = "View provider's booking history")
    public ResponseEntity<List<BookingResponseDTO>> getBookings(Principal principal) {
        return ResponseEntity.ok(bookingManagementService.getProviderBookings(principal.getName()));
    }

    @GetMapping("/bookings/{id}")
    @Operation(summary = "View specific booking details")
    public ResponseEntity<BookingResponseDTO> getBookingDetails(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(bookingManagementService.getBookingDetails(principal.getName(), id));
    }

    @PutMapping("/bookings/{id}/accept")
    @Operation(summary = "Accept a pending booking request")
    public ResponseEntity<BookingResponseDTO> acceptBooking(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(bookingManagementService.acceptBooking(principal.getName(), id));
    }

    @PutMapping("/bookings/{id}/reject")
    @Operation(summary = "Reject a pending booking request")
    public ResponseEntity<BookingResponseDTO> rejectBooking(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(bookingManagementService.rejectBooking(principal.getName(), id));
    }

    @PutMapping("/bookings/{id}/start")
    @Operation(summary = "Mark a booking as in-progress (started work)")
    public ResponseEntity<BookingResponseDTO> startService(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(bookingManagementService.startService(principal.getName(), id));
    }

    @PutMapping("/bookings/{id}/complete")
    @Operation(summary = "Mark a booking as completed (finished work)")
    public ResponseEntity<BookingResponseDTO> completeService(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(bookingManagementService.completeService(principal.getName(), id));
    }

    // --- EARNINGS ---

    @GetMapping("/earnings")
    @Operation(summary = "View comprehensive earnings dashboard data")
    public ResponseEntity<EarningsDTO> getEarnings(Principal principal) {
        return ResponseEntity.ok(earningsService.getEarningsDashboard(principal.getName()));
    }

    @GetMapping("/payment-history")
    @Operation(summary = "View specific payment transaction logs")
    public ResponseEntity<List<PaymentHistoryDTO>> getPaymentHistory(Principal principal) {
        return ResponseEntity.ok(earningsService.getPaymentHistory(principal.getName()));
    }

    // --- REVIEWS ---

    @GetMapping("/reviews")
    @Operation(summary = "View all reviews left by customers")
    public ResponseEntity<List<ReviewResponse>> getReviews(Principal principal) {
        return ResponseEntity.ok(providerService.getCustomerReviews(principal.getName()));
    }

    // --- NOTIFICATIONS ---

    @GetMapping("/notifications")
    @Operation(summary = "Get list of notifications for the provider")
    public ResponseEntity<List<NotificationDTO>> getNotifications(Principal principal) {
        return ResponseEntity.ok(notificationService.getCustomerNotifications(principal.getName()));
    }

    @PutMapping("/notifications/read/{id}")
    @Operation(summary = "Mark a notification alert as read")
    public ResponseEntity<Map<String, String>> markNotificationRead(Principal principal, @PathVariable Long id) {
        notificationService.markCustomerNotificationAsRead(principal.getName(), id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/notifications/{id}")
    @Operation(summary = "Delete notification alert")
    public ResponseEntity<Map<String, String>> deleteNotification(Principal principal, @PathVariable Long id) {
        notificationService.deleteCustomerNotification(principal.getName(), id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted");
        return ResponseEntity.ok(response);
    }

    // --- DASHBOARD ---

    @GetMapping("/dashboard")
    @Operation(summary = "View full dashboard metrics and status feed")
    public ResponseEntity<DashboardDTO> getDashboard(Principal principal) {
        return ResponseEntity.ok(providerService.getProviderDashboard(principal.getName()));
    }
}
