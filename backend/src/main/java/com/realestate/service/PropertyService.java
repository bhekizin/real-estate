package com.realestate.service;

import com.realestate.dto.PropertyRequest;
import com.realestate.model.Property;
import com.realestate.model.PropertyImage;
import com.realestate.model.User;
import com.realestate.repository.PropertyImageRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository imageRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public PropertyService(PropertyRepository propertyRepository,
                           PropertyImageRepository imageRepository,
                           UserRepository userRepository) {
        this.propertyRepository = propertyRepository;
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
    }

    public Page<Property> getAllProperties(Pageable pageable) {
        return propertyRepository.findAll(pageable);
    }

    public Property getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setViewsCount(property.getViewsCount() + 1);
        propertyRepository.save(property);
        return property;
    }

    public Page<Property> getFeaturedProperties(Pageable pageable) {
        return propertyRepository.findByFeaturedTrue(pageable);
    }

    public Page<Property> searchProperties(String keyword, String city,
                                           String propertyType, BigDecimal minPrice,
                                           BigDecimal maxPrice, Integer bedrooms,
                                           Integer bathrooms, Pageable pageable) {
        Property.PropertyType type = null;
        if (propertyType != null && !propertyType.isEmpty()) {
            type = Property.PropertyType.valueOf(propertyType.toUpperCase());
        }
        return propertyRepository.searchProperties(keyword, city, type, minPrice, maxPrice,
                bedrooms, bathrooms, pageable);
    }

    public List<String> getDistinctCities() {
        return propertyRepository.findDistinctCities();
    }

    @Transactional
    public Property createProperty(PropertyRequest request, String agentEmail) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        Property property = new Property();
        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(Property.PropertyType.valueOf(request.getPropertyType().toUpperCase()));
        property.setPrice(request.getPrice());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setAreaSqft(request.getAreaSqft());
        property.setYearBuilt(request.getYearBuilt());
        property.setParkingSpaces(request.getParkingSpaces());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setZipCode(request.getZipCode());
        property.setCountry(request.getCountry());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
        property.setFurnished(request.getFurnished());
        property.setHasPool(request.getHasPool());
        property.setHasGarden(request.getHasGarden());
        property.setHasGarage(request.getHasGarage());
        property.setHasSecurity(request.getHasSecurity());
        property.setPetFriendly(request.getPetFriendly());
        property.setAgent(agent);
        property.setStatus(Property.PropertyStatus.AVAILABLE);

        return propertyRepository.save(property);
    }

    @Transactional
    public Property updateProperty(Long id, PropertyRequest request, String agentEmail) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (!property.getAgent().getId().equals(agent.getId()) && agent.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You can only edit your own properties");
        }

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(Property.PropertyType.valueOf(request.getPropertyType().toUpperCase()));
        property.setPrice(request.getPrice());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setAreaSqft(request.getAreaSqft());
        property.setYearBuilt(request.getYearBuilt());
        property.setParkingSpaces(request.getParkingSpaces());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setZipCode(request.getZipCode());
        property.setCountry(request.getCountry());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
        property.setFurnished(request.getFurnished());
        property.setHasPool(request.getHasPool());
        property.setHasGarden(request.getHasGarden());
        property.setHasGarage(request.getHasGarage());
        property.setHasSecurity(request.getHasSecurity());
        property.setPetFriendly(request.getPetFriendly());

        return propertyRepository.save(property);
    }

    @Transactional
    public void deleteProperty(Long id, String agentEmail) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (!property.getAgent().getId().equals(agent.getId()) && agent.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You can only delete your own properties");
        }

        propertyRepository.delete(property);
    }

    public void updatePropertyStatus(Long id, String status, String agentEmail) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (!property.getAgent().getId().equals(agent.getId()) && agent.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You can only update your own properties");
        }

        property.setStatus(Property.PropertyStatus.valueOf(status.toUpperCase()));
        propertyRepository.save(property);
    }

    public String uploadImage(Long propertyId, MultipartFile file, boolean isPrimary) throws IOException {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        String imageUrl = "/uploads/" + filename;

        PropertyImage image = new PropertyImage();
        image.setProperty(property);
        image.setImageUrl(imageUrl);
        image.setIsPrimary(isPrimary);

        imageRepository.save(image);
        return imageUrl;
    }

    public Page<Property> getAgentProperties(String agentEmail, Pageable pageable) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        return propertyRepository.findByAgent(agent, pageable);
    }

    public List<Property> getPropertiesForComparison(List<Long> ids) {
        return propertyRepository.findAllById(ids);
    }
}
