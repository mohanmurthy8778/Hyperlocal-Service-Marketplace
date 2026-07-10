package com.hyperlocalmarketplace.repository;

import com.hyperlocalmarketplace.entity.Otp;
import com.hyperlocalmarketplace.entity.User;
import com.hyperlocalmarketplace.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByUserAndOtpCodeAndPurposeAndIsUsedFalse(User user, String otpCode, OtpPurpose purpose);
    List<Otp> findByUserAndPurposeAndIsUsedFalse(User user, OtpPurpose purpose);
}
