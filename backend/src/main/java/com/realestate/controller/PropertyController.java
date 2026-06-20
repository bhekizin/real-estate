package com.realestate.controller;

import com.realestate.dto.PropertyRequest;
import com.realestate.model.Property;
import com.realestate.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public ResponseEntity<Page<Property>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(propertyService.getAllProperties(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getProperty(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @GetMapping("/featured")
    public ResponseEntity<Page<Property>> getFeaturedProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(propertyService.getFeaturedProperties(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Property>> searchProperties(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer bathrooms,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(propertyService.searchProperties(keyword, city, propertyType,
                minPrice, maxPrice, bedrooms, bathrooms, pageable));
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities() {
        return ResponseEntity.ok(propertyService.getDistinctCities());
    }

    @GetMapping("/compare")
    public ResponseEntity<List<Property>> compareProperties(@RequestParam String ids) {
        List<Long> propertyIds = Arrays.stream(ids.split(","))
                .map(String::trim)
                .map(Long::parseLong)
                .collect(Collectors.toList());
        return ResponseEntity.ok(propertyService.getPropertiesForComparison(propertyIds));
    }

    @PostMapping
    public ResponseEntity<Property> createProperty(@Valid @RequestBody PropertyRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(propertyService.createProperty(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable Long id,
                                                   @Valid @RequestBody PropertyRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProperty(@PathVariable Long id,
                                                              Authentication authentication) {
        propertyService.deleteProperty(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Property deleted successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateStatus(@PathVariable Long id,
                                                            @RequestParam String status,
                                                            Authentication authentication) {
        propertyService.updatePropertyStatus(id, status, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<Map<String, String>> uploadImage(@PathVariable Long id,
                                                           @RequestParam("file") MultipartFile file,
                                                           @RequestParam(defaultValue = "false") boolean isPrimary) throws IOException {
        String imageUrl = propertyService.uploadImage(id, file, isPrimary);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
}
