package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Role;
import com.hyperlocalmarketplace.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
