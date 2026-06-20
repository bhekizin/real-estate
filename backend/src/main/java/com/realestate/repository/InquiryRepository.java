package com.realestate.repository;

import com.realestate.model.Inquiry;
import com.realestate.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    Page<Inquiry> findByAgent(User agent, Pageable pageable);

    List<Inquiry> findByPropertyId(Long propertyId);

    long countByAgentAndStatus(User agent, Inquiry.InquiryStatus status);

    long countByAgent(User agent);
}
