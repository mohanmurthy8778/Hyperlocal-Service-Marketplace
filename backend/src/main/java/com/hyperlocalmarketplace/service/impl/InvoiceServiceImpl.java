package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.InvoiceDTO;
import com.hyperlocalmarketplace.entity.Invoice;
import com.hyperlocalmarketplace.entity.Payment;
import com.hyperlocalmarketplace.entity.Booking;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.repository.InvoiceRepository;
import com.hyperlocalmarketplace.repository.PaymentRepository;
import com.hyperlocalmarketplace.service.InvoiceService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceServiceImpl.class);

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    @Transactional
    public InvoiceDTO createInvoice(Payment payment) {
        log.info("Generating invoice record for payment ID: {}", payment.getId());
        
        Booking booking = payment.getBooking();
        String invoiceNum = "INV-" + booking.getId() + "-" + (1000 + new Random().nextInt(9000));

        double baseAmount = payment.getAmount();
        double gst = baseAmount * 0.18; // 18% GST as requested
        double total = baseAmount + gst;

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNum)
                .payment(payment)
                .booking(booking)
                .amount(baseAmount)
                .gst(gst)
                .total(total)
                .paymentStatus(payment.getStatus().name())
                .build();

        invoiceRepository.save(invoice);
        log.info("Successfully created Invoice: {}", invoiceNum);

        return mapToDTO(invoice);
    }

    @Override
    public InvoiceDTO getInvoiceByPaymentId(Long paymentId) {
        Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for payment ID: " + paymentId));
        return mapToDTO(invoice);
    }

    @Override
    public ByteArrayInputStream generateInvoicePdf(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseGet(() -> {
                    // Create invoice if it does not exist
                    InvoiceDTO dto = createInvoice(payment);
                    return invoiceRepository.findByPaymentId(paymentId).orElse(null);
                });

        if (invoice == null) {
            invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice could not be created/found"));
        }

        Booking booking = payment.getBooking();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font configurations
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(15, 23, 42)); // Slate Blue
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 65, 85));
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(15, 23, 42));
            Font goldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(194, 150, 50)); // Elegant Gold

            // Header - ServiceHub Logo
            Paragraph brandName = new Paragraph("ServiceHub", headerFont);
            brandName.setAlignment(Element.ALIGN_LEFT);
            document.add(brandName);

            Paragraph subtitle = new Paragraph("Hyperlocal Service Marketplace", FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 116, 139)));
            subtitle.setAlignment(Element.ALIGN_LEFT);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Divider Line
            Paragraph divider = new Paragraph("______________________________________________________________________________", normalFont);
            divider.setSpacingAfter(20);
            document.add(divider);

            // Invoice Title & Info block
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);

            PdfPCell cell1 = new PdfPCell(new Paragraph("INVOICE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(15, 23, 42))));
            cell1.setBorder(Rectangle.NO_BORDER);
            infoTable.addCell(cell1);

            PdfPCell cell2 = new PdfPCell(new Paragraph("Invoice Number: " + invoice.getInvoiceNumber() + "\nDate: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")), normalFont));
            cell2.setBorder(Rectangle.NO_BORDER);
            cell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            infoTable.addCell(cell2);

            document.add(infoTable);

            // Customer and Provider Details Side-by-Side
            PdfPTable partiesTable = new PdfPTable(2);
            partiesTable.setWidthPercentage(100);
            partiesTable.setSpacingAfter(25);

            // Customer block
            PdfPCell customerCell = new PdfPCell();
            customerCell.setBorder(Rectangle.NO_BORDER);
            customerCell.addElement(new Paragraph("BILL TO:", boldFont));
            customerCell.addElement(new Paragraph("Name: " + booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName(), normalFont));
            customerCell.addElement(new Paragraph("Phone: " + booking.getCustomer().getPhone(), normalFont));
            customerCell.addElement(new Paragraph("Email: " + booking.getCustomer().getUser().getEmail(), normalFont));
            partiesTable.addCell(customerCell);

            // Provider block
            PdfPCell providerCell = new PdfPCell();
            providerCell.setBorder(Rectangle.NO_BORDER);
            providerCell.addElement(new Paragraph("SERVICE PROVIDER:", boldFont));
            providerCell.addElement(new Paragraph("Name: " + booking.getProvider().getFirstName() + " " + booking.getProvider().getLastName(), normalFont));
            providerCell.addElement(new Paragraph("Phone: " + booking.getProvider().getPhone(), normalFont));
            providerCell.addElement(new Paragraph("Category: " + booking.getService().getCategory().getName(), normalFont));
            partiesTable.addCell(providerCell);

            document.add(partiesTable);

            // Booking and Transaction Details
            Paragraph bookingHeader = new Paragraph("BOOKING & TRANSACTION DETAILS", boldFont);
            bookingHeader.setSpacingAfter(10);
            document.add(bookingHeader);

            PdfPTable detailsTable = new PdfPTable(4);
            detailsTable.setWidthPercentage(100);
            detailsTable.setSpacingAfter(20);

            // Set headers
            String[] headers = {"Service Description", "Date & Time", "Payment Status", "Total Paid"};
            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Paragraph(header, boldFont));
                headerCell.setBackgroundColor(new Color(241, 245, 249)); // light slate background
                headerCell.setPadding(8);
                headerCell.setBorder(Rectangle.BOX);
                headerCell.setBorderColor(new Color(226, 232, 240));
                detailsTable.addCell(headerCell);
            }

            // Populate rows
            PdfPCell descCell = new PdfPCell(new Paragraph(booking.getService().getName(), normalFont));
            descCell.setPadding(8);
            descCell.setBorderColor(new Color(226, 232, 240));
            detailsTable.addCell(descCell);

            PdfPCell dtCell = new PdfPCell(new Paragraph(booking.getBookingDate().toString() + " at " + booking.getBookingTime().toString(), normalFont));
            dtCell.setPadding(8);
            dtCell.setBorderColor(new Color(226, 232, 240));
            detailsTable.addCell(dtCell);

            PdfPCell statusCell = new PdfPCell(new Paragraph(payment.getStatus().name(), goldFont));
            statusCell.setPadding(8);
            statusCell.setBorderColor(new Color(226, 232, 240));
            detailsTable.addCell(statusCell);

            PdfPCell totalCell = new PdfPCell(new Paragraph("INR " + String.format("%.2f", invoice.getTotal()), boldFont));
            totalCell.setPadding(8);
            totalCell.setBorderColor(new Color(226, 232, 240));
            detailsTable.addCell(totalCell);

            document.add(detailsTable);

            // Breakdown Table
            PdfPTable breakdownTable = new PdfPTable(2);
            breakdownTable.setWidthPercentage(40);
            breakdownTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            breakdownTable.setSpacingAfter(30);

            addBreakdownRow(breakdownTable, "Subtotal:", "INR " + String.format("%.2f", invoice.getAmount()), normalFont, normalFont);
            addBreakdownRow(breakdownTable, "GST (18%):", "INR " + String.format("%.2f", invoice.getGst()), normalFont, normalFont);
            addBreakdownRow(breakdownTable, "Grand Total:", "INR " + String.format("%.2f", invoice.getTotal()), boldFont, boldFont);

            document.add(breakdownTable);

            // Footer Section
            Paragraph thankYouMsg = new Paragraph("Thank you for choosing ServiceHub.", FontFactory.getFont(FontFactory.HELVETICA_BOLD_ITALIC, 11, new Color(194, 150, 50)));
            thankYouMsg.setAlignment(Element.ALIGN_CENTER);
            thankYouMsg.setSpacingAfter(40);
            document.add(thankYouMsg);

            Paragraph footerLine = new Paragraph("For support, reach out at support@servicehub.com. This is an electronically generated invoice.", FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(148, 163, 184)));
            footerLine.setAlignment(Element.ALIGN_CENTER);
            document.add(footerLine);

            document.close();
        } catch (DocumentException de) {
            log.error("PDF generation exception: ", de);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addBreakdownRow(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        labelCell.setPadding(4);
        table.addCell(labelCell);

        PdfPCell valCell = new PdfPCell(new Paragraph(value, valFont));
        valCell.setBorder(Rectangle.NO_BORDER);
        valCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valCell.setPadding(4);
        table.addCell(valCell);
    }

    private InvoiceDTO mapToDTO(Invoice invoice) {
        Booking booking = invoice.getBooking();
        Payment payment = invoice.getPayment();
        return InvoiceDTO.builder()
                .invoiceNumber(invoice.getInvoiceNumber())
                .bookingId(booking.getId())
                .customerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName())
                .providerName(booking.getProvider().getFirstName() + " " + booking.getProvider().getLastName())
                .serviceName(booking.getService().getName())
                .category(booking.getService().getCategory().getName())
                .bookingDate(booking.getBookingDate().toString() + " " + booking.getBookingTime().toString())
                .paymentDate(payment.getPaymentDate().toString())
                .amount(invoice.getAmount())
                .gst(invoice.getGst())
                .total(invoice.getTotal())
                .paymentStatus(invoice.getPaymentStatus())
                .build();
    }
}
