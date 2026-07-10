package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Customer;
import com.hyperlocalmarketplace.entity.Favorite;
import com.hyperlocalmarketplace.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByCustomer(Customer customer);
    List<Favorite> findByCustomerId(Long customerId);
    Optional<Favorite> findByCustomerIdAndProviderId(Long customerId, Long providerId);
    boolean existsByCustomerIdAndProviderId(Long customerId, Long providerId);
}
