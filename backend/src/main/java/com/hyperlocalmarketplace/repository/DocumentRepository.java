package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Document;
import com.hyperlocalmarketplace.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProvider(Provider provider);
    List<Document> findByProviderId(Long providerId);
}
