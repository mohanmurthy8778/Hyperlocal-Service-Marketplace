package com.hyperlocalmarketplace.mapper;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class DtoMapper {

    public UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole() != null ? user.getRole().getName().name() : null)
                .emailVerified(user.isEmailVerified())
                .accountStatus(user.getAccountStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public CustomerProfileResponse toCustomerProfileResponse(Customer customer) {
        if (customer == null) return null;
        return CustomerProfileResponse.builder()
                .id(customer.getId())
                .email(customer.getUser().getEmail())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .phone(customer.getPhone())
                .gender(customer.getGender())
                .dob(customer.getDob())
                .avatar(customer.getAvatar())
                .emergencyPhone(customer.getEmergencyPhone())
                .build();
    }

    public ProviderProfileResponse toProviderProfileResponse(Provider provider) {
        if (provider == null) return null;
        return ProviderProfileResponse.builder()
                .id(provider.getId())
                .email(provider.getUser().getEmail())
                .firstName(provider.getFirstName())
                .lastName(provider.getLastName())
                .phone(provider.getPhone())
                .gender(provider.getGender())
                .dob(provider.getDob())
                .avatar(provider.getAvatar())
                .bio(provider.getBio())
                .languages(provider.getLanguages())
                .experience(provider.getExperience())
                .category(provider.getCategory())
                .skills(provider.getSkills())
                .workingHourStart(provider.getWorkingHourStart())
                .workingHourEnd(provider.getWorkingHourEnd())
                .availableDays(provider.getAvailableDays())
                .emergencyPhone(provider.getEmergencyPhone())
                .rating(provider.getRating())
                .completedJobs(provider.getCompletedJobs())
                .isVerified(provider.isVerified())
                .joinedDate(provider.getJoinedDate())
                .accountHolderName(provider.getAccountHolderName())
                .bankName(provider.getBankName())
                .accountNumber(provider.getAccountNumber())
                .ifscCode(provider.getIfscCode())
                .upiId(provider.getUpiId())
                .website(provider.getWebsite())
                .facebook(provider.getFacebook())
                .instagram(provider.getInstagram())
                .linkedin(provider.getLinkedin())
                .emailNotifications(provider.isEmailNotifications())
                .smsNotifications(provider.isSmsNotifications())
                .pushNotifications(provider.isPushNotifications())
                .bookingAlerts(provider.isBookingAlerts())
                .marketingEmails(provider.isMarketingEmails())
                .build();
    }

    public CategoryDto toCategoryDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .build();
    }

    public ServiceDto toServiceDto(Service service) {
        if (service == null) return null;
        return ServiceDto.builder()
                .id(service.getId())
                .providerId(service.getProvider().getId())
                .providerName(service.getProvider().getFirstName() + " " + service.getProvider().getLastName())
                .categoryId(service.getCategory().getId())
                .categoryName(service.getCategory().getName())
                .name(service.getName())
                .description(service.getDescription())
                .startingPrice(service.getStartingPrice())
                .experience(service.getExperience())
                .imageUrl(service.getImageUrl())
                .build();
    }

    public BookingResponse toBookingResponse(Booking booking) {
        if (booking == null) return null;
        return BookingResponse.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .customerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName())
                .serviceId(booking.getService().getId())
                .serviceName(booking.getService().getName())
                .providerId(booking.getProvider().getId())
                .providerName(booking.getProvider().getFirstName() + " " + booking.getProvider().getLastName())
                .providerPhone(booking.getProvider().getPhone())
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus().name())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    public PaymentResponse toPaymentResponse(Payment payment) {
        if (payment == null) return null;
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .orderId(payment.getOrderId())
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public ReviewResponse toReviewResponse(Review review) {
        if (review == null) return null;
        return ReviewResponse.builder()
                .id(review.getId())
                .bookingId(review.getBooking().getId())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getFirstName() + " " + review.getCustomer().getLastName())
                .providerId(review.getProvider().getId())
                .providerName(review.getProvider().getFirstName() + " " + review.getProvider().getLastName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public NotificationDto toNotificationDto(Notification notification) {
        if (notification == null) return null;
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
