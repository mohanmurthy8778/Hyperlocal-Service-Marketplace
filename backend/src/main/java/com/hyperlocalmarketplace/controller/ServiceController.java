package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.ServiceDto;
import com.hyperlocalmarketplace.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@Tag(name = "Explore Services", description = "Public endpoints to search and filter service listings")
public class ServiceController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    @Operation(summary = "Search and filter hyperlocal services by keyword or category ID")
    public ResponseEntity<List<ServiceDto>> searchServices(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(customerService.searchServices(query, categoryId));
    }
}
