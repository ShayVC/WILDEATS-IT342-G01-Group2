package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.FoodItemEntity;
import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItemEntity, Long> {
    /**
     * Find all food items for a specific shop
     * @param shopId The ID of the shop
     * @return List of food items for the shop
     */
    List<FoodItemEntity> findByShopShopId(Long shopId);
    
    /**
     * Find all available food items for a specific shop
     * @param shopId The ID of the shop
     * @return List of available food items for the shop
     */
    List<FoodItemEntity> findByShopShopIdAndIsAvailableTrue(Long shopId);
    
    /**
     * Find a food item by name in a specific shop
     * @param name The name of the food item
     * @param shopId The ID of the shop
     * @return The food item if found
     */
    FoodItemEntity findByNameAndShopShopId(String name, Long shopId);
}
