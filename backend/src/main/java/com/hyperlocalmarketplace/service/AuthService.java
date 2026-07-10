package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.*;

public interface AuthService {
    UserDto register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String email);
    AuthResponse refreshToken(String refreshToken);
    void verifyEmail(VerifyEmailRequest request);
    void resendOtp(ResendOtpRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(String email, ChangePasswordRequest request);
    UserDto getCurrentUserProfile(String email);
}
