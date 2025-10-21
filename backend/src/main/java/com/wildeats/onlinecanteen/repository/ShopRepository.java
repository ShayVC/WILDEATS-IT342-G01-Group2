package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.ShopEntity;
import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<ShopEntity, Long> {

    /**
     * Find all active shops
     * @return List of active shops
     */
    List<ShopEntity> findByIsActiveTrue();
    
    /**
     * Find all shops owned by a specific user
     * @param ownerId The ID of the shop owner
     * @return List of shops owned by the user
     */
    List<ShopEntity> findByOwnerIdAndIsActiveTrue(Long ownerId);
    
    /**
     * Find a shop by its name
     * @param name The name of the shop
     * @return The shop if found
     */
    ShopEntity findByName(String name);
}
