package com.hyperlocalmarketplace.config;

import com.hyperlocalmarketplace.entity.Role;
import com.hyperlocalmarketplace.entity.User;
import com.hyperlocalmarketplace.enums.RoleType;
import com.hyperlocalmarketplace.repository.RoleRepository;
import com.hyperlocalmarketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
        seedAdminUser();
    }

    private void seedRoles() {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByName(roleType).isEmpty()) {
                Role role = Role.builder()
                        .name(roleType)
                        .build();
                roleRepository.save(role);
                log.info("Seeded role: {}", roleType);
            }
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail("admin@hyperlocal.com")) {
            Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                    .orElseThrow(() -> new IllegalStateException("Admin role not found!"));

            User admin = User.builder()
                    .firstName("System")
                    .lastName("Admin")
                    .email("admin@hyperlocal.com")
                    .phone("+1234567890")
                    .password(passwordEncoder.encode("Admin123!"))
                    .role(adminRole)
                    .accountStatus("ACTIVE")
                    .emailVerified(true)
                    .build();

            userRepository.save(admin);
            log.info("Seeded default administrator account: admin@hyperlocal.com / Admin123!");
        }
    }
}
