package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.enums.OtpPurpose;
import com.hyperlocalmarketplace.enums.RoleType;
import com.hyperlocalmarketplace.exception.BadRequestException;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.mapper.DtoMapper;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.security.JwtTokenProvider;
import com.hyperlocalmarketplace.service.AuthService;
import com.hyperlocalmarketplace.service.EmailService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final ProviderRepository providerRepository;
    private final OtpRepository otpRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final DtoMapper dtoMapper;

    @Override
    @Transactional
    public UserDto register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered!");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number is already registered!");
        }

        RoleType roleType;
        try {
            String roleName = request.getRole().toUpperCase();
            if (!roleName.startsWith("ROLE_")) {
                roleName = "ROLE_" + roleName;
            }
            if (roleName.equals("ROLE_SERVICE_PROVIDER")) {
                roleName = "ROLE_PROVIDER";
            }
            roleType = RoleType.valueOf(roleName);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid Role: must be CUSTOMER, SERVICE_PROVIDER or ADMIN");
        }

        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new BadRequestException("Role not found in system: " + roleType));

        // Create base user, default active but emailVerified is false
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .accountStatus("ACTIVE")
                .emailVerified(false)
                .build();

        user = userRepository.save(user);

        // Save respective profile
        if (roleType == RoleType.ROLE_CUSTOMER) {
            Customer customer = Customer.builder()
                    .user(user)
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phone(request.getPhone())
                    .build();
            customerRepository.save(customer);
        } else if (roleType == RoleType.ROLE_PROVIDER) {
            Provider provider = Provider.builder()
                    .user(user)
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phone(request.getPhone())
                    .rating(4.8)
                    .completedJobs(0)
                    .isVerified(false)
                    .build();
            providerRepository.save(provider);
        }

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(1000000));
        Otp otp = Otp.builder()
                .user(user)
                .otpCode(otpCode)
                .purpose(OtpPurpose.EMAIL_VERIFICATION)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();
        otpRepository.save(otp);

        // Send verification email
        emailService.sendRegistrationVerificationEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName(), otpCode);

        log.info("User registered successfully: {}, OTP sent to email.", user.getEmail());
        return dtoMapper.toUserDto(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password!");
        }

        if (!user.isEmailVerified()) {
            throw new BadRequestException("Please verify your email address before logging in.");
        }

        if (!"ACTIVE".equals(user.getAccountStatus())) {
            throw new BadRequestException("Your account status is currently " + user.getAccountStatus() + ". Access denied.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshTokenString = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // Invalidate previous refresh tokens for user
        refreshTokenRepository.findByUser(user).ifPresent(refreshTokenRepository::delete);

        // Save fresh Refresh Token to DB
        Instant expiryInstant = jwtTokenProvider.extractClaim(refreshTokenString, Claims::getExpiration).toInstant();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenString)
                .expiryDate(expiryInstant)
                .build();
        refreshTokenRepository.save(refreshToken);

        log.info("User logged in successfully: {}", user.getEmail());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .role(user.getRole().getName().name())
                .user(dtoMapper.toUserDto(user))
                .build();
    }

    @Override
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            refreshTokenRepository.findByUser(user).ifPresent(refreshTokenRepository::delete);
            log.info("User logged out and refresh token revoked: {}", email);
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid or unregistered refresh token!"));

        if (rt.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(rt);
            throw new BadRequestException("Refresh token has expired! Please login again.");
        }

        User user = rt.getUser();
        String newAccessToken = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().getName().name())
                .user(dtoMapper.toUserDto(user))
                .build();
    }

    @Override
    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified!");
        }

        Otp otp = otpRepository.findByUserAndOtpCodeAndPurposeAndIsUsedFalse(user, request.getOtp(), OtpPurpose.EMAIL_VERIFICATION)
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP!"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired!");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);

        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName(), user.getRole().getName().name());
        log.info("Email verified successfully for: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        OtpPurpose purpose;
        try {
            purpose = OtpPurpose.valueOf(request.getPurpose().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid OTP purpose! Must be EMAIL_VERIFICATION or PASSWORD_RESET.");
        }

        // Invalidate active OTPs for user/purpose
        List<Otp> activeOtps = otpRepository.findByUserAndPurposeAndIsUsedFalse(user, purpose);
        for (Otp oldOtp : activeOtps) {
            oldOtp.setUsed(true);
        }
        otpRepository.saveAll(activeOtps);

        // Generate and save new OTP
        String otpCode = String.format("%06d", new Random().nextInt(1000000));
        Otp otp = Otp.builder()
                .user(user)
                .otpCode(otpCode)
                .purpose(purpose)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();
        otpRepository.save(otp);

        // Send email
        if (purpose == OtpPurpose.EMAIL_VERIFICATION) {
            emailService.sendRegistrationVerificationEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName(), otpCode);
        } else {
            emailService.sendForgotPasswordEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName(), otpCode);
        }
        log.info("Resent OTP of type {} to: {}", purpose, user.getEmail());
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (!"ACTIVE".equals(user.getAccountStatus())) {
            throw new BadRequestException("User account is currently inactive or suspended.");
        }

        // Invalidate active PASSWORD_RESET OTPs
        List<Otp> activeOtps = otpRepository.findByUserAndPurposeAndIsUsedFalse(user, OtpPurpose.PASSWORD_RESET);
        for (Otp oldOtp : activeOtps) {
            oldOtp.setUsed(true);
        }
        otpRepository.saveAll(activeOtps);

        // Generate new OTP
        String otpCode = String.format("%06d", new Random().nextInt(1000000));
        Otp otp = Otp.builder()
                .user(user)
                .otpCode(otpCode)
                .purpose(OtpPurpose.PASSWORD_RESET)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();
        otpRepository.save(otp);

        // Send password reset email
        emailService.sendForgotPasswordEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName(), otpCode);
        log.info("Password reset request initialized for: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match!");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        Otp otp = otpRepository.findByUserAndOtpCodeAndPurposeAndIsUsedFalse(user, request.getOtp(), OtpPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP!"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired!");
        }

        // Encrypt and save new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Use OTP
        otp.setUsed(true);
        otpRepository.save(otp);

        // Send notification email
        emailService.sendPasswordChangedEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName());
        log.info("Password reset successfully for: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match!");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect current password!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Send confirmation email
        emailService.sendPasswordChangedEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName());
        log.info("Password changed successfully for authenticated user: {}", email);
    }

    @Override
    public UserDto getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return dtoMapper.toUserDto(user);
    }
}
