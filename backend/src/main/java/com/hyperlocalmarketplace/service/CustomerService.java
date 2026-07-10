package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface CustomerService {
    // Original methods for backward compatibility
    CustomerProfileResponse getProfile(String email);
    CustomerProfileResponse updateProfile(String email, CustomerProfileRequest request);
    List<ServiceDto> searchServices(String query, Long categoryId);
    void addFavoriteProvider(String email, Long providerId);
    void removeFavoriteProvider(String email, Long providerId);
    List<ProviderProfileResponse> getFavoriteProviders(String email);
    boolean isFavoriteProvider(String email, Long providerId);

    // New detailed Customer Module methods
    CustomerProfileDTO getCustomerProfile(String email);
    CustomerProfileDTO updateCustomerProfile(String email, UpdateCustomerDTO request);
    String uploadProfileImage(String email, MultipartFile file) throws IOException;
    List<ServiceResponseDTO> searchAndFilterServices(String keyword, Long categoryId, String location, 
                                                    String providerName, Double rating, Boolean availability, 
                                                    Double distance, String sortBy, int page, int size);
    List<FavoriteDTO> getCustomerFavorites(String email);
    DashboardDTO getCustomerDashboard(String email);
    ServiceResponseDTO getServiceDetails(Long id);
}
