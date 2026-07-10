package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Administrator Module", description = "Endpoints for System Analytics, Payouts commission, Categories, and Verifications")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private com.hyperlocalmarketplace.service.PaymentService paymentService;

    @Autowired
    private com.hyperlocalmarketplace.service.RevenueService revenueService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard key analytics and counts")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getAdminDashboardStats());
    }

    @GetMapping("/users")
    @Operation(summary = "List all registered accounts in the database")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/toggle-status")
    @Operation(summary = "Ban/unban a user account")
    public ResponseEntity<Map<String, String>> toggleUser(@PathVariable Long id) {
        adminService.toggleUserStatus(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User active status updated");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/providers/{id}/approve")
    @Operation(summary = "Verify a service provider's account")
    public ResponseEntity<Map<String, String>> approveProvider(@PathVariable Long id) {
        adminService.approveProvider(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Provider successfully verified and approved");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/providers/{id}/reject")
    @Operation(summary = "Reject/Suspend a service provider's account")
    public ResponseEntity<Map<String, String>> rejectProvider(@PathVariable Long id) {
        adminService.rejectProvider(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Provider has been unapproved");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a new service listing category")
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(adminService.createCategory(categoryDto));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Modify a service listing category")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(adminService.updateCategory(id, categoryDto));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a service listing category")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Category deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payments")
    @Operation(summary = "View all payments in the system")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPaymentsForAdmin());
    }

    @GetMapping("/revenue")
    @Operation(summary = "View overall revenue analytics report")
    public ResponseEntity<RevenueDTO> getRevenueReport() {
        return ResponseEntity.ok(revenueService.getRevenueReport());
    }

    @GetMapping("/bookings")
    @Operation(summary = "View all bookings in the system")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }
}
