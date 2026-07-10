package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.ServiceDto;
import com.hyperlocalmarketplace.dto.ServiceRequestDTO;
import com.hyperlocalmarketplace.dto.ServiceResponseDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ServiceManagementService {
    ServiceResponseDTO addService(String providerEmail, ServiceRequestDTO request, MultipartFile image);
    List<ServiceResponseDTO> getProviderServices(String providerEmail);
    ServiceResponseDTO getServiceById(String providerEmail, Long serviceId);
    ServiceResponseDTO updateService(String providerEmail, Long serviceId, ServiceRequestDTO request, MultipartFile image);
    void deleteService(String providerEmail, Long serviceId);
}
