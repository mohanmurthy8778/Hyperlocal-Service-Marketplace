package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Booking;
import com.hyperlocalmarketplace.entity.Customer;
import com.hyperlocalmarketplace.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer(Customer customer);
    List<Booking> findByProvider(Provider provider);
    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByProviderId(Long providerId);
}
