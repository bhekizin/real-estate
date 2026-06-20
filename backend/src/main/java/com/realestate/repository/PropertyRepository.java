package com.realestate.repository;

import com.realestate.model.Property;
import com.realestate.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    Page<Property> findByFeaturedTrue(Pageable pageable);

    Page<Property> findByAgent(User agent, Pageable pageable);

    List<Property> findByAgent(User agent);

    @Query("SELECT p FROM Property p WHERE p.status = 'AVAILABLE' " +
           "AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.city) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:city IS NULL OR LOWER(p.city) = LOWER(:city)) " +
           "AND (:propertyType IS NULL OR p.propertyType = :propertyType) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:bedrooms IS NULL OR p.bedrooms >= :bedrooms) " +
           "AND (:bathrooms IS NULL OR p.bathrooms >= :bathrooms)")
    Page<Property> searchProperties(
            @Param("keyword") String keyword,
            @Param("city") String city,
            @Param("propertyType") Property.PropertyType propertyType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("bedrooms") Integer bedrooms,
            @Param("bathrooms") Integer bathrooms,
            Pageable pageable);

    @Query("SELECT DISTINCT p.city FROM Property p WHERE p.status = 'AVAILABLE' ORDER BY p.city")
    List<String> findDistinctCities();

    long countByAgent(User agent);

    long countByAgentAndStatus(User agent, Property.PropertyStatus status);
}
