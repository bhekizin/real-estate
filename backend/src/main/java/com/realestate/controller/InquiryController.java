package com.realestate.controller;

import com.realestate.dto.InquiryRequest;
import com.realestate.model.Inquiry;
import com.realestate.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    public InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @PostMapping
    public ResponseEntity<Inquiry> createInquiry(@Valid @RequestBody InquiryRequest request) {
        return ResponseEntity.ok(inquiryService.createInquiry(request));
    }

    @GetMapping("/agent")
    public ResponseEntity<Page<Inquiry>> getAgentInquiries(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(inquiryService.getAgentInquiries(
                authentication.getName(),
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateStatus(@PathVariable Long id,
                                                            @RequestParam String status) {
        inquiryService.updateInquiryStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "Inquiry status updated"));
    }

    @GetMapping("/agent/count")
    public ResponseEntity<Map<String, Long>> getNewCount(Authentication authentication) {
        long count = inquiryService.getNewInquiryCount(authentication.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }
}
