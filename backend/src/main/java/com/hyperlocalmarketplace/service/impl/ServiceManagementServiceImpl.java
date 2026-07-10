package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.entity.Service;
import com.hyperlocalmarketplace.exception.BadRequestException;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.exception.UnauthorizedException;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.service.CloudinaryService;
import com.hyperlocalmarketplace.service.ServiceManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceManagementServiceImpl implements ServiceManagementService {

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    public ServiceResponseDTO addService(String providerEmail, ServiceRequestDTO request, MultipartFile image) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        String imageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80";
        if (image != null && !image.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadFile(image, "services");
            } catch (IOException e) {
                throw new BadRequestException("Failed to upload service image!");
            }
        } else if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            imageUrl = request.getImageUrls().get(0);
        }

        Service service = Service.builder()
                .provider(provider)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .startingPrice(request.getStartingPrice())
                .experience(provider.getExperience())
                .imageUrl(imageUrl)
                .build();

        service = serviceRepository.save(service);
        return mapToServiceResponseDTO(service);
    }

    @Override
    public List<ServiceResponseDTO> getProviderServices(String providerEmail) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        return serviceRepository.findByProvider(provider).stream()
                .map(this::mapToServiceResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceResponseDTO getServiceById(String providerEmail, Long serviceId) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found"));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new UnauthorizedException("You are not authorized to view this service listing");
        }

        return mapToServiceResponseDTO(service);
    }

    @Override
    public ServiceResponseDTO updateService(String providerEmail, Long serviceId, ServiceRequestDTO request, MultipartFile image) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found"));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new UnauthorizedException("You do not own this service listing!");
        }

        if (request.getName() != null) service.setName(request.getName());
        if (request.getDescription() != null) service.setDescription(request.getDescription());
        if (request.getStartingPrice() != null) service.setStartingPrice(request.getStartingPrice());

        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadFile(image, "services");
                service.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new BadRequestException("Failed to upload service image!");
            }
        } else if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            service.setImageUrl(request.getImageUrls().get(0));
        }

        service = serviceRepository.save(service);
        return mapToServiceResponseDTO(service);
    }

    @Override
    public void deleteService(String providerEmail, Long serviceId) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found"));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new UnauthorizedException("You do not own this service listing!");
        }

        serviceRepository.delete(service);
    }

    private ServiceResponseDTO mapToServiceResponseDTO(Service service) {
        Provider provider = service.getProvider();
        List<Review> reviews = reviewRepository.findByProviderId(provider.getId());
        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(provider.getRating());

        List<ReviewDTO> reviewDTOs = reviews.stream()
                .map(r -> ReviewDTO.builder()
                        .id(r.getId())
                        .bookingId(r.getBooking().getId())
                        .customerId(r.getCustomer().getId())
                        .customerName(r.getCustomer().getFirstName() + " " + r.getCustomer().getLastName())
                        .customerAvatar(r.getCustomer().getAvatar())
                        .providerId(provider.getId())
                        .providerName(provider.getFirstName() + " " + provider.getLastName())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .reviewDate(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ServiceResponseDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .categoryName(service.getCategory().getName())
                .categoryId(service.getCategory().getId())
                .description(service.getDescription())
                .price(service.getStartingPrice())
                .duration("2 hours") // standard estimate
                .imageUrl(service.getImageUrl())
                .providerId(provider.getId())
                .providerName(provider.getFirstName() + " " + provider.getLastName())
                .providerAvatar(provider.getAvatar())
                .providerRating(avgRating)
                .providerCompletedJobs(provider.getCompletedJobs())
                .providerVerified(provider.isVerified())
                .averageRating(avgRating)
                .reviews(reviewDTOs)
                .build();
    }
}
