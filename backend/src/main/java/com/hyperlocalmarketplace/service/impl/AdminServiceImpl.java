package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.enums.PaymentStatus;
import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.mapper.DtoMapper;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DtoMapper dtoMapper;

    @Override
    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCustomers", customerRepository.count());
        stats.put("totalProviders", providerRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        
        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS || p.getStatus() == PaymentStatus.SUCCESSFUL)
                .mapToDouble(Payment::getAmount)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        return stats;
    }

    @Override
    @Transactional
    public void approveProvider(Long providerId) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with ID: " + providerId));
        provider.setVerified(true);
        providerRepository.save(provider);
    }

    @Override
    @Transactional
    public void rejectProvider(Long providerId) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with ID: " + providerId));
        provider.setVerified(false);
        providerRepository.save(provider);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .active(u.isActive())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = Category.builder()
                .name(categoryDto.getName())
                .description(categoryDto.getDescription())
                .imageUrl(categoryDto.getImageUrl())
                .build();
        category = categoryRepository.save(category);
        return dtoMapper.toCategoryDto(category);
    }

    @Override
    @Transactional
    public CategoryDto updateCategory(Long categoryId, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));

        if (categoryDto.getName() != null) category.setName(categoryDto.getName());
        if (categoryDto.getDescription() != null) category.setDescription(categoryDto.getDescription());
        if (categoryDto.getImageUrl() != null) category.setImageUrl(categoryDto.getImageUrl());

        category = categoryRepository.save(category);
        return dtoMapper.toCategoryDto(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));
        categoryRepository.delete(category);
    }

    @Override
    public Map<String, Object> getOverallRevenueReport() {
        List<Payment> successfulPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS || p.getStatus() == PaymentStatus.SUCCESSFUL)
                .collect(Collectors.toList());

        double grossVolume = successfulPayments.stream().mapToDouble(Payment::getAmount).sum();
        double netPlatformCut = grossVolume * 0.15; // 15% marketplace commission fee

        Map<String, Object> report = new HashMap<>();
        report.put("grossVolume", grossVolume);
        report.put("netPlatformRevenue", netPlatformCut);
        report.put("totalPaidInvoices", successfulPayments.size());
        report.put("payments", successfulPayments.stream().map(dtoMapper::toPaymentResponse).collect(Collectors.toList()));

        return report;
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(dtoMapper::toBookingResponse)
                .collect(Collectors.toList());
    }
}
