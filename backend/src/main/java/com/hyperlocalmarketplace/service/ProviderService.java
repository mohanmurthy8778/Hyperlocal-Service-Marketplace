package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

public interface ProviderService {
    // Existing methods
    ProviderProfileResponse getProfile(String email);
    ProviderProfileResponse updateProfile(String email, ProviderProfileRequest request);
    void uploadDocument(String email, String docName, String docType, MultipartFile file);
    List<DocumentDto> getDocuments(String email);
    List<ServiceDto> getProviderServices(String email);
    ServiceDto addService(String email, ServiceDto serviceDto, MultipartFile image);
    ServiceDto updateService(String email, Long serviceId, ServiceDto serviceDto, MultipartFile image);
    void deleteService(String email, Long serviceId);
    Map<String, Object> getEarningsReport(String email);
    List<ReviewResponse> getCustomerReviews(String email);

    // New Module specific methods
    ProviderProfileDTO getProviderProfile(String email);
    ProviderProfileDTO updateProviderProfile(String email, UpdateProviderDTO request);
    String uploadProfileImage(String email, MultipartFile image);
    void uploadProviderDocument(String email, String docName, String docType, MultipartFile file);
    DashboardDTO getProviderDashboard(String email);
}
