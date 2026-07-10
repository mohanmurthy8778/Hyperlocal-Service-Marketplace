package com.hyperlocalmarketplace.entity;

import com.hyperlocalmarketplace.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private String orderId; // Maps to razorpayOrderId

    private String paymentId; // Maps to razorpayPaymentId

    private String signature;

    @Column(nullable = false)
    private Double amount;

    private String currency = "INR";

    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    private LocalDateTime transactionDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper alias methods for existing code compatibility
    public String getRazorpayOrderId() {
        return this.orderId;
    }

    public void setRazorpayOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getRazorpayPaymentId() {
        return this.paymentId;
    }

    public void setRazorpayPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public LocalDateTime getPaymentDate() {
        return this.transactionDate != null ? this.transactionDate : this.createdAt;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.transactionDate = paymentDate;
    }
}
