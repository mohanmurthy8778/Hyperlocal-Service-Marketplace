package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Category;
import com.hyperlocalmarketplace.entity.Provider;
import com.hyperlocalmarketplace.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByProvider(Provider provider);
    List<Service> findByCategoryId(Long categoryId);
    List<Service> findByNameContainingIgnoreCase(String name);
}
