package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.exception.BadRequestException;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.exception.UnauthorizedException;
import com.hyperlocalmarketplace.mapper.DtoMapper;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private DtoMapper dtoMapper;

    @Override
    @Transactional
    public ReviewResponse addReview(String customerEmail, ReviewRequest request) {
        Customer customer = customerRepository.findByUserEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You do not have permission to review this booking");
        }

        if (booking.getStatus() != com.hyperlocalmarketplace.enums.BookingStatus.COMPLETED) {
            throw new BadRequestException("You can only review completed bookings!");
        }

        Review review = Review.builder()
                .booking(booking)
                .customer(customer)
                .provider(booking.getProvider())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        // Recalculate average rating of provider
        updateProviderAverageRating(booking.getProvider().getId());

        return dtoMapper.toReviewResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(String customerEmail, Long reviewId, ReviewRequest request) {
        Customer customer = customerRepository.findByUserEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to update this review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);

        // Recalculate average rating of provider
        updateProviderAverageRating(review.getProvider().getId());

        return dtoMapper.toReviewResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(String customerEmail, Long reviewId) {
        Customer customer = customerRepository.findByUserEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this review");
        }

        Long providerId = review.getProvider().getId();
        reviewRepository.delete(review);

        // Recalculate average rating of provider
        updateProviderAverageRating(providerId);
    }

    @Override
    public List<ReviewResponse> getReviewsForProvider(Long providerId) {
        return reviewRepository.findByProviderId(providerId).stream()
                .map(dtoMapper::toReviewResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Double calculateAverageRating(Long providerId) {
        List<Review> reviews = reviewRepository.findByProviderId(providerId);
        if (reviews.isEmpty()) {
            return 4.8; // Default initial rating
        }

        double total = reviews.stream().mapToDouble(Review::getRating).sum();
        return total / reviews.size();
    }

    private void updateProviderAverageRating(Long providerId) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        Double newRating = calculateAverageRating(providerId);
        provider.setRating(newRating);
        providerRepository.save(provider);
    }

    @Override
    @Transactional
    public ReviewDTO createCustomerReview(String email, ReviewDTO dto) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You do not have permission to review this booking");
        }

        if (!"COMPLETED".equals(booking.getStatus().name())) {
            throw new BadRequestException("You can only review completed bookings!");
        }

        Review review = Review.builder()
                .booking(booking)
                .customer(customer)
                .provider(booking.getProvider())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        review = reviewRepository.save(review);
        updateProviderAverageRating(booking.getProvider().getId());

        return mapToDTO(review);
    }

    @Override
    @Transactional
    public ReviewDTO updateCustomerReview(String email, Long id, ReviewDTO dto) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to update this review");
        }

        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review = reviewRepository.save(review);
        updateProviderAverageRating(review.getProvider().getId());

        return mapToDTO(review);
    }

    @Override
    @Transactional
    public void deleteCustomerReview(String email, Long id) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this review");
        }

        Long providerId = review.getProvider().getId();
        reviewRepository.delete(review);
        updateProviderAverageRating(providerId);
    }

    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .bookingId(review.getBooking().getId())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getFirstName() + " " + review.getCustomer().getLastName())
                .customerAvatar(review.getCustomer().getAvatar())
                .providerId(review.getProvider().getId())
                .providerName(review.getProvider().getFirstName() + " " + review.getProvider().getLastName())
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewDate(review.getCreatedAt())
                .build();
    }
}
