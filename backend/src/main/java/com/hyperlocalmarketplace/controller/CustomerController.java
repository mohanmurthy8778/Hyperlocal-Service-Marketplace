package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@Tag(name = "Customer Module", description = "Endpoints for complete Customer Operations including Profile, Addresses, Bookings, Favorites, Reviews, and Notifications")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private AuthService authService;

    // --- PROFILE ENDPOINTS ---

    @GetMapping("/profile")
    @Operation(summary = "Get current customer profile with addresses")
    public ResponseEntity<CustomerProfileDTO> getProfile(Principal principal) {
        return ResponseEntity.ok(customerService.getCustomerProfile(principal.getName()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update customer profile fields")
    public ResponseEntity<CustomerProfileDTO> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateCustomerDTO request) {
        return ResponseEntity.ok(customerService.updateCustomerProfile(principal.getName(), request));
    }

    @PostMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload customer profile picture")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            Principal principal,
            @RequestParam("file") MultipartFile file) throws IOException {
        String url = customerService.uploadProfileImage(principal.getName(), file);
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", url);
        response.put("message", "Profile image uploaded successfully");
        return ResponseEntity.ok(response);
    }

    // --- ADDRESS ENDPOINTS ---
    @PutMapping("/change-password")
    @Operation(summary = "Change customer password")
    public ResponseEntity<Map<String, String>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getName(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/addresses")
    @Operation(summary = "List all customer addresses")
    public ResponseEntity<List<AddressDTO>> getAddresses(Principal principal) {
        return ResponseEntity.ok(addressService.getCustomerAddresses(principal.getName()));
    }

    @PostMapping("/address")
    @Operation(summary = "Create a new customer address")
    public ResponseEntity<AddressDTO> addAddress(
            Principal principal,
            @Valid @RequestBody AddressDTO request) {
        return ResponseEntity.ok(addressService.createCustomerAddress(principal.getName(), request));
    }

    @PutMapping("/address/{id}")
    @Operation(summary = "Update an existing customer address")
    public ResponseEntity<AddressDTO> updateAddress(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddressDTO request) {
        return ResponseEntity.ok(addressService.updateCustomerAddress(principal.getName(), id, request));
    }

    @DeleteMapping("/address/{id}")
    @Operation(summary = "Delete a customer address")
    public ResponseEntity<Map<String, String>> deleteAddress(
            Principal principal,
            @PathVariable Long id) {
        addressService.deleteCustomerAddress(principal.getName(), id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Address deleted successfully");
        return ResponseEntity.ok(response);
    }

    // --- SERVICES ENDPOINTS ---

    @GetMapping("/services")
    @Operation(summary = "Search, filter and sort services")
    public ResponseEntity<List<ServiceResponseDTO>> searchServices(
            @Parameter(description = "Keyword search for service name or description") @RequestParam(required = false) String keyword,
            @Parameter(description = "Filter by category ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Filter by city or state") @RequestParam(required = false) String location,
            @Parameter(description = "Filter by provider name") @RequestParam(required = false) String providerName,
            @Parameter(description = "Minimum provider rating") @RequestParam(required = false) Double rating,
            @Parameter(description = "Filter by active availability") @RequestParam(required = false) Boolean availability,
            @Parameter(description = "Maximum radius distance in KM") @RequestParam(required = false) Double distance,
            @Parameter(description = "Sort by: rating, popularity, newest, nearest") @RequestParam(required = false, defaultValue = "popularity") String sortBy,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "10") int size) {
        List<ServiceResponseDTO> results = customerService.searchAndFilterServices(
                keyword, categoryId, location, providerName, rating, availability, distance, sortBy, page, size
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping("/services/{id}")
    @Operation(summary = "Get detailed service information with provider and reviews")
    public ResponseEntity<ServiceResponseDTO> getServiceDetails(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getServiceDetails(id));
    }

    // --- BOOKING ENDPOINTS ---

    @PostMapping("/bookings")
    @Operation(summary = "Book a service listing")
    public ResponseEntity<BookingResponseDTO> bookService(
            Principal principal,
            @Valid @RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(bookingService.createCustomerBooking(principal.getName(), request));
    }

    @GetMapping("/bookings")
    @Operation(summary = "View full booking history with address context")
    public ResponseEntity<List<BookingResponseDTO>> getBookingHistory(Principal principal) {
        return ResponseEntity.ok(bookingService.getCustomerBookingHistory(principal.getName()));
    }

    @GetMapping("/bookings/{id}")
    @Operation(summary = "View details of a specific booking")
    public ResponseEntity<BookingResponseDTO> getBookingDetails(
            Principal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getCustomerBookingDetails(principal.getName(), id));
    }

    @PutMapping("/bookings/cancel/{id}")
    @Operation(summary = "Cancel an active booking")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            Principal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelCustomerBooking(principal.getName(), id));
    }

    // --- FAVORITES ENDPOINTS ---

    @GetMapping("/favorites")
    @Operation(summary = "Get list of customer's favorite providers")
    public ResponseEntity<List<FavoriteDTO>> getCustomerFavorites(Principal principal) {
        return ResponseEntity.ok(customerService.getCustomerFavorites(principal.getName()));
    }

    @PostMapping("/favorites/{providerId}")
    @Operation(summary = "Add a provider to customer's favorites")
    public ResponseEntity<Map<String, String>> addFavoriteProvider(
            Principal principal,
            @PathVariable Long providerId) {
        customerService.addFavoriteProvider(principal.getName(), providerId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Provider added to favorites");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/favorites/{providerId}")
    @Operation(summary = "Remove a provider from customer's favorites")
    public ResponseEntity<Map<String, String>> removeFavoriteProvider(
            Principal principal,
            @PathVariable Long providerId) {
        customerService.removeFavoriteProvider(principal.getName(), providerId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Provider removed from favorites");
        return ResponseEntity.ok(response);
    }

    // --- REVIEWS ENDPOINTS ---

    @PostMapping("/reviews")
    @Operation(summary = "Submit a review for a completed booking")
    public ResponseEntity<ReviewDTO> addReview(
            Principal principal,
            @Valid @RequestBody ReviewDTO request) {
        return ResponseEntity.ok(reviewService.createCustomerReview(principal.getName(), request));
    }

    @PutMapping("/reviews/{id}")
    @Operation(summary = "Update a customer's submitted review")
    public ResponseEntity<ReviewDTO> updateReview(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody ReviewDTO request) {
        return ResponseEntity.ok(reviewService.updateCustomerReview(principal.getName(), id, request));
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Delete a customer's review")
    public ResponseEntity<Map<String, String>> deleteReview(
            Principal principal,
            @PathVariable Long id) {
        reviewService.deleteCustomerReview(principal.getName(), id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Review deleted successfully");
        return ResponseEntity.ok(response);
    }

    // --- NOTIFICATIONS ENDPOINTS ---

    @GetMapping("/notifications")
    @Operation(summary = "List customer notifications")
    public ResponseEntity<List<NotificationDTO>> getNotifications(Principal principal) {
        return ResponseEntity.ok(notificationService.getCustomerNotifications(principal.getName()));
    }

    @PutMapping("/notifications/read/{id}")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Map<String, String>> markNotificationAsRead(
            Principal principal,
            @PathVariable Long id) {
        notificationService.markCustomerNotificationAsRead(principal.getName(), id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/notifications/{id}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<Map<String, String>> deleteNotification(
            Principal principal,
            @PathVariable Long id) {
        notificationService.deleteCustomerNotification(principal.getName(), id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted successfully");
        return ResponseEntity.ok(response);
    }

    // --- DASHBOARD ENDPOINTS ---

    @GetMapping("/dashboard")
    @Operation(summary = "Retrieve customer unified dashboard summary")
    public ResponseEntity<DashboardDTO> getDashboardSummary(Principal principal) {
        return ResponseEntity.ok(customerService.getCustomerDashboard(principal.getName()));
    }
}
