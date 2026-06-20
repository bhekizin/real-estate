package com.realestate.controller;

import com.realestate.model.Property;
import com.realestate.model.User;
import com.realestate.repository.InquiryRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final InquiryRepository inquiryRepository;

    public AdminController(UserRepository userRepository, PropertyRepository propertyRepository,
                           InquiryRepository inquiryRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.inquiryRepository = inquiryRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        long totalUsers = userRepository.count();
        long totalProperties = propertyRepository.count();
        long totalInquiries = inquiryRepository.count();
        long totalAgents = userRepository.findByRole(User.Role.AGENT).size();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalProperties", totalProperties,
                "totalInquiries", totalInquiries,
                "totalAgents", totalAgents
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<Map<String, String>> toggleUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.getActive());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User status toggled"));
    }

    @PutMapping("/properties/{id}/featured")
    public ResponseEntity<Map<String, String>> toggleFeatured(@PathVariable Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setFeatured(!property.getFeatured());
        propertyRepository.save(property);
        return ResponseEntity.ok(Map.of("message", "Featured status toggled"));
    }

    @DeleteMapping("/properties/{id}")
    public ResponseEntity<Map<String, String>> deleteProperty(@PathVariable Long id) {
        propertyRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Property deleted"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}
