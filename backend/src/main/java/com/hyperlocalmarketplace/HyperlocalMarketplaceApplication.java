package com.hyperlocalmarketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HyperlocalMarketplaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(HyperlocalMarketplaceApplication.class, args);
    }
}
