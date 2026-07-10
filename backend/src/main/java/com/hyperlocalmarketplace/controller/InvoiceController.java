package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.InvoiceDTO;
import com.hyperlocalmarketplace.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Invoice Management", description = "Endpoints for retrieving structured metadata and downloading professional generated PDF invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/{paymentId}")
    @Operation(summary = "Get invoice metadata by payment ID")
    public ResponseEntity<InvoiceDTO> getInvoiceByPaymentId(@PathVariable Long paymentId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByPaymentId(paymentId));
    }

    @GetMapping("/download/{paymentId}")
    @Operation(summary = "Download generated professional PDF invoice")
    public ResponseEntity<Resource> downloadInvoice(@PathVariable Long paymentId) {
        ByteArrayInputStream pdfStream = invoiceService.generateInvoicePdf(paymentId);
        InputStreamResource resource = new InputStreamResource(pdfStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Invoice_Payment_" + paymentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
