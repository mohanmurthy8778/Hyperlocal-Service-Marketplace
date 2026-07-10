package com.hyperlocalmarketplace.controller;

import com.hyperlocalmarketplace.dto.CategoryDto;
import com.hyperlocalmarketplace.entity.Category;
import com.hyperlocalmarketplace.mapper.DtoMapper;
import com.hyperlocalmarketplace.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Explore Categories", description = "Public endpoints to discover categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DtoMapper dtoMapper;

    @GetMapping
    @Operation(summary = "Explore all available service categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryDto> dtos = categories.stream()
                .map(dtoMapper::toCategoryDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
