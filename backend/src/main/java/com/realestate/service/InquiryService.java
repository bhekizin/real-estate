package com.realestate.service;

import com.realestate.dto.InquiryRequest;
import com.realestate.model.Inquiry;
import com.realestate.model.Property;
import com.realestate.model.User;
import com.realestate.repository.InquiryRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public InquiryService(InquiryRepository inquiryRepository,
                          PropertyRepository propertyRepository,
                          UserRepository userRepository) {
        this.inquiryRepository = inquiryRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    public Inquiry createInquiry(InquiryRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        Inquiry inquiry = new Inquiry();
        inquiry.setProperty(property);
        inquiry.setSenderName(request.getSenderName());
        inquiry.setSenderEmail(request.getSenderEmail());
        inquiry.setSenderPhone(request.getSenderPhone());
        inquiry.setMessage(request.getMessage());
        inquiry.setAgent(property.getAgent());
        inquiry.setStatus(Inquiry.InquiryStatus.NEW);

        return inquiryRepository.save(inquiry);
    }

    public Page<Inquiry> getAgentInquiries(String agentEmail, Pageable pageable) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        return inquiryRepository.findByAgent(agent, pageable);
    }

    public void updateInquiryStatus(Long id, String status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setStatus(Inquiry.InquiryStatus.valueOf(status.toUpperCase()));
        inquiryRepository.save(inquiry);
    }

    public long getNewInquiryCount(String agentEmail) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        return inquiryRepository.countByAgentAndStatus(agent, Inquiry.InquiryStatus.NEW);
    }
}
