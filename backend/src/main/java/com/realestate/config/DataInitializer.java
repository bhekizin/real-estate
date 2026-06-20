package com.realestate.config;

import com.realestate.model.Inquiry;
import com.realestate.model.Property;
import com.realestate.model.PropertyImage;
import com.realestate.model.User;
import com.realestate.repository.InquiryRepository;
import com.realestate.repository.PropertyImageRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@Profile("h2")
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepository, PropertyRepository propertyRepository,
                               PropertyImageRepository imageRepository, InquiryRepository inquiryRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            // Create admin user
            User admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setEmail("admin@realestate.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);

            // Create agent user
            User agent = new User();
            agent.setFirstName("John");
            agent.setLastName("Agent");
            agent.setEmail("agent@realestate.com");
            agent.setPassword(passwordEncoder.encode("agent123"));
            agent.setPhone("+27 71 234 5678");
            agent.setRole(User.Role.AGENT);
            agent.setActive(true);
            userRepository.save(agent);

            // Create sample properties
            createProperty(propertyRepository, imageRepository, agent, "Modern Family Home in Sandton",
                    "Beautiful 4-bedroom house with a spacious garden and pool. Located in a secure estate.",
                    Property.PropertyType.HOUSE, new BigDecimal("3500000"),
                    4, 3, new BigDecimal("350"), 2019, 2,
                    "12 Oak Avenue", "Sandton", "Gauteng", "2196",
                    true, true, true, true, true, false, true,
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop");

            createProperty(propertyRepository, imageRepository, agent, "Luxury Apartment in Cape Town",
                    "Stunning 2-bedroom apartment with ocean views and modern finishes. Walking distance to the beach.",
                    Property.PropertyType.APARTMENT, new BigDecimal("2800000"),
                    2, 2, new BigDecimal("120"), 2021, 1,
                    "45 Beach Road", "Cape Town", "Western Cape", "8001",
                    true, false, false, true, true, true, true,
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop");

            createProperty(propertyRepository, imageRepository, agent, "Cozy Townhouse in Pretoria",
                    "Well-maintained 3-bedroom townhouse in a quiet complex. Close to schools and shopping centers.",
                    Property.PropertyType.TOWNHOUSE, new BigDecimal("1850000"),
                    3, 2, new BigDecimal("180"), 2015, 1,
                    "8 Jacaranda Street", "Pretoria", "Gauteng", "0081",
                    false, false, true, true, true, false, true,
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop");

            createProperty(propertyRepository, imageRepository, agent, "Commercial Office Space in Johannesburg",
                    "Prime office space in the heart of Johannesburg CBD. Open plan with meeting rooms.",
                    Property.PropertyType.COMMERCIAL, new BigDecimal("5200000"),
                    0, 2, new BigDecimal("500"), 2010, 5,
                    "100 Main Street", "Johannesburg", "Gauteng", "2000",
                    true, false, false, true, true, false, false,
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop");

            createProperty(propertyRepository, imageRepository, agent, "Vacant Land in Durban North",
                    "Prime residential land with sea views. Perfect for building your dream home.",
                    Property.PropertyType.LAND, new BigDecimal("1200000"),
                    0, 0, new BigDecimal("800"), 0, 0,
                    "Plot 23, Umhlanga Ridge", "Durban", "KwaZulu-Natal", "4051",
                    false, false, false, false, false, false, true,
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&h=600&fit=crop");

            createProperty(propertyRepository, imageRepository, agent, "Executive Condo in Umhlanga",
                    "Top-floor 3-bedroom condo with panoramic ocean views. Fully furnished luxury living.",
                    Property.PropertyType.CONDO, new BigDecimal("4100000"),
                    3, 2, new BigDecimal("200"), 2022, 2,
                    "15 Lighthouse Road", "Umhlanga", "KwaZulu-Natal", "4319",
                    true, true, false, true, true, true, true,
                    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop");

            // Create sample inquiries
            List<Property> allProperties = propertyRepository.findAll();
            if (allProperties.size() >= 3) {
                createInquiry(inquiryRepository, allProperties.get(0), agent,
                        "Thabo Molefe", "thabo.molefe@gmail.com", "+27 82 345 6789",
                        "Hi, I am very interested in this property. Is it still available? I would like to schedule a viewing this weekend if possible.");

                createInquiry(inquiryRepository, allProperties.get(1), agent,
                        "Sarah van der Merwe", "sarah.vdm@outlook.com", "+27 73 456 7890",
                        "Good day, could you please provide more details about the monthly levies and rates? Also, are pets allowed in the complex?");

                createInquiry(inquiryRepository, allProperties.get(2), agent,
                        "David Nkosi", "david.nkosi@yahoo.com", "+27 61 567 8901",
                        "I would like to know if the price is negotiable. I am a cash buyer and can close quickly. Please contact me at your earliest convenience.");

                createInquiry(inquiryRepository, allProperties.get(0), agent,
                        "Priya Patel", "priya.patel@hotmail.com", "+27 84 678 9012",
                        "Beautiful property! Can you tell me more about the security features and the estate rules? Is there fibre internet available?");
            }

            System.out.println("=== Sample data loaded successfully ===");
            System.out.println("Admin: admin@realestate.com / admin123");
            System.out.println("Agent: agent@realestate.com / agent123");
        };
    }

    private void createProperty(PropertyRepository repo, PropertyImageRepository imageRepo, User agent, String title, String description,
                                 Property.PropertyType type, BigDecimal price,
                                 int bedrooms, int bathrooms, BigDecimal area, int yearBuilt, int parking,
                                 String address, String city, String state, String zipCode,
                                 boolean furnished, boolean pool, boolean garden,
                                 boolean garage, boolean security, boolean petFriendly, boolean featured,
                                 String imageUrl1, String imageUrl2) {
        Property p = new Property();
        p.setTitle(title);
        p.setDescription(description);
        p.setPropertyType(type);
        p.setStatus(Property.PropertyStatus.AVAILABLE);
        p.setPrice(price);
        p.setBedrooms(bedrooms);
        p.setBathrooms(bathrooms);
        p.setAreaSqft(area);
        p.setYearBuilt(yearBuilt);
        p.setParkingSpaces(parking);
        p.setAddress(address);
        p.setCity(city);
        p.setState(state);
        p.setZipCode(zipCode);
        p.setCountry("South Africa");
        p.setFurnished(furnished);
        p.setHasPool(pool);
        p.setHasGarden(garden);
        p.setHasGarage(garage);
        p.setHasSecurity(security);
        p.setPetFriendly(petFriendly);
        p.setFeatured(featured);
        p.setViewsCount(0);
        p.setAgent(agent);
        repo.save(p);

        // Add images
        PropertyImage img1 = new PropertyImage();
        img1.setProperty(p);
        img1.setImageUrl(imageUrl1);
        img1.setIsPrimary(true);
        img1.setCaption(title + " - Main");
        imageRepo.save(img1);

        PropertyImage img2 = new PropertyImage();
        img2.setProperty(p);
        img2.setImageUrl(imageUrl2);
        img2.setIsPrimary(false);
        img2.setCaption(title + " - Interior");
        imageRepo.save(img2);
    }

    private void createInquiry(InquiryRepository repo, Property property, User agent,
                                String senderName, String senderEmail, String senderPhone, String message) {
        Inquiry inquiry = new Inquiry();
        inquiry.setProperty(property);
        inquiry.setAgent(agent);
        inquiry.setSenderName(senderName);
        inquiry.setSenderEmail(senderEmail);
        inquiry.setSenderPhone(senderPhone);
        inquiry.setMessage(message);
        inquiry.setStatus(Inquiry.InquiryStatus.NEW);
        repo.save(inquiry);
    }
}
