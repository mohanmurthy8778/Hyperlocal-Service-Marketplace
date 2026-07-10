package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Customer;
import com.hyperlocalmarketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUser(User user);
    Optional<Customer> findByUserEmail(String email);
}
