package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.EarningsDTO;
import com.hyperlocalmarketplace.dto.PaymentHistoryDTO;
import java.util.List;

public interface EarningsService {
    EarningsDTO getEarningsDashboard(String providerEmail);
    List<PaymentHistoryDTO> getPaymentHistory(String providerEmail);
}
