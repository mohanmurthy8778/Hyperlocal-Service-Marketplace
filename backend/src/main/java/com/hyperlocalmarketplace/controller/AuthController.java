package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.response.ApiResponse;
import com.hyperlocalmarketplace.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication Module", description = "Endpoints for Registration, Login, and Password Management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new Customer or Service Provider")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto registeredUser = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully. Please verify your email.", registeredUser));
    }

    @PostMapping("/login")
    @Operation(summary = "Login to acquire JWT Access and Refresh tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout session and invalidate current refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(Principal principal) {
        if (principal != null) {
            authService.logout(principal.getName());
        }
        return ResponseEntity.ok(ApiResponse.success("Session logged out successfully"));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Generate a new access token using a valid refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify account email using the 6-digit OTP code")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend OTP for email verification or password reset")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a 6-digit verification code to reset password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Verification OTP sent to email"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Submit OTP verification code and configure a new password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been successfully updated"));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password for the authenticated session")
    public ResponseEntity<ApiResponse<Void>> changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized session"));
        }
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Retrieve current authenticated user profile details")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUserProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized session"));
        }
        UserDto profile = authService.getCurrentUserProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
    }
}
