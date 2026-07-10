package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.*;
import java.util.List;
import java.util.Map;

public interface AdminService {
    Map<String, Object> getAdminDashboardStats();
    void approveProvider(Long providerId);
    void rejectProvider(Long providerId);
    List<UserDto> getAllUsers();
    void toggleUserStatus(Long userId);
    CategoryDto createCategory(CategoryDto categoryDto);
    CategoryDto updateCategory(Long categoryId, CategoryDto categoryDto);
    void deleteCategory(Long categoryId);
    Map<String, Object> getOverallRevenueReport();
    List<BookingResponseDTO> getAllBookings();
}
