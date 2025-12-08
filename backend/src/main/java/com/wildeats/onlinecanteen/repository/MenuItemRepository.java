package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.MenuItemEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItemEntity, Long> {
    /**
     * Find all menu items for a specific shop
     * 
     * @param shopId The ID of the shop
     * @return List of menu items for the shop
     */
    List<MenuItemEntity> findByShopShopId(Long shopId);

    /**
     * Find all available menu items for a specific shop
     * 
     * @param shopId      The ID of the shop
     * @param isAvailable The availability status
     * @return List of available menu items for the shop
     */
    List<MenuItemEntity> findByShopShopIdAndIsAvailable(Long shopId, Boolean isAvailable);

    /**
     * Find a menu item by name in a specific shop
     * 
     * @param itemName The name of the menu item
     * @param shopId   The ID of the shop
     * @return Optional containing the menu item if found
     */
    Optional<MenuItemEntity> findByItemNameAndShopShopId(String itemName, Long shopId);

    /**
     * Find all menu items with price less than or equal to a maximum price
     * 
     * @param shopId   The ID of the shop
     * @param maxPrice The maximum price
     * @return List of menu items within the price range
     */
    @Query("SELECT m FROM MenuItemEntity m WHERE m.shop.shopId = :shopId AND m.price <= :maxPrice")
    List<MenuItemEntity> findByShopIdAndPriceLessThanEqual(@Param("shopId") Long shopId,
            @Param("maxPrice") Double maxPrice);

    /**
     * Search menu items by name (case-insensitive) in a specific shop
     * 
     * @param shopId     The ID of the shop
     * @param searchTerm The search term
     * @return List of menu items matching the search term
     */
    @Query("SELECT m FROM MenuItemEntity m WHERE m.shop.shopId = :shopId AND LOWER(m.itemName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<MenuItemEntity> searchByItemName(@Param("shopId") Long shopId, @Param("searchTerm") String searchTerm);

    /**
     * Count available menu items for a specific shop
     * 
     * @param shopId The ID of the shop
     * @return Count of available menu items
     */
    @Query("SELECT COUNT(m) FROM MenuItemEntity m WHERE m.shop.shopId = :shopId AND m.isAvailable = true")
    long countAvailableByShopId(@Param("shopId") Long shopId);
}