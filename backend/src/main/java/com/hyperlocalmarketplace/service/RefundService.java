package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.RefundRequest;
import com.hyperlocalmarketplace.dto.RefundResponse;
import java.util.List;

public interface RefundService {
    RefundResponse requestRefund(RefundRequest request);
    RefundResponse approveRefund(Long paymentId);
    RefundResponse rejectRefund(Long paymentId);
    List<RefundResponse> getAllRefunds();
}
