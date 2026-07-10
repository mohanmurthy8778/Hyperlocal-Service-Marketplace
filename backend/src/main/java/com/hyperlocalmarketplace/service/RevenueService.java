package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.RevenueDTO;

public interface RevenueService {
    RevenueDTO getRevenueReport();
    RevenueDTO calculateEarningsForPayment(Double amount);
}
