package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.InvoiceDTO;
import com.hyperlocalmarketplace.entity.Payment;
import java.io.ByteArrayInputStream;

public interface InvoiceService {
    InvoiceDTO createInvoice(Payment payment);
    InvoiceDTO getInvoiceByPaymentId(Long paymentId);
    ByteArrayInputStream generateInvoicePdf(Long paymentId);
}
