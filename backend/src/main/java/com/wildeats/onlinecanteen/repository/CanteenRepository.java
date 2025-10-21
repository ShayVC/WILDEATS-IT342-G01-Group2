package com.wildeats.onlinecanteen.repository;

import com.wildeats.onlinecanteen.entity.CanteenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CanteenRepository extends JpaRepository<CanteenEntity, Long> {
    
 
    List<CanteenEntity> findByStatus(String status);
    
   
    List<CanteenEntity> findByCustomerNameContainingIgnoreCase(String customerName);
    
   
    List<CanteenEntity> findByTotalPriceGreaterThan(double price);
    
   
    List<CanteenEntity> findByTotalPriceLessThan(double price);
    
  
    List<CanteenEntity> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}