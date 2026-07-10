package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Provider;
import com.hyperlocalmarketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    Optional<Provider> findByUser(User user);
    Optional<Provider> findByUserEmail(String email);
    List<Provider> findByIsVerified(boolean isVerified);
}
