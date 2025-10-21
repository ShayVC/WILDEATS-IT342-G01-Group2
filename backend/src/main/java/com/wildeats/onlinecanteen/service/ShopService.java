package com.wildeats.onlinecanteen.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ShopService {
    private static final Logger logger = LoggerFactory.getLogger(ShopService.class);

    @Autowired
    private ShopRepository shopRepo;

    /**
     * Get all active shops
     * @return List of all active shops
     */
    public List<ShopEntity> getAllShops() {
        logger.info("Fetching all shops");
        return shopRepo.findByIsActiveTrue();
    }

    /**
     * Get a shop by its ID
     * @param id The shop ID
     * @return The shop if found, null otherwise
     */
    public ShopEntity getShopById(Long id) {
        logger.info("Fetching shop with ID: {}", id);
        Optional<ShopEntity> shop = shopRepo.findById(id);
        return shop.orElse(null);
    }
    
    /**
     * Get all shops owned by a specific user
     * @param userId The ID of the shop owner
     * @return List of shops owned by the user
     */
    public List<ShopEntity> getShopsByOwnerId(Long userId) {
        logger.info("Fetching shops for owner with ID: {}", userId);
        return shopRepo.findByOwnerIdAndIsActiveTrue(userId);
    }
    
    /**
     * Check if a user owns a specific shop
     * @param userId The ID of the user
     * @param shopId The ID of the shop
     * @return true if the user owns the shop, false otherwise
     */
    public boolean isShopOwnedByUser(Long userId, Long shopId) {
        ShopEntity shop = getShopById(shopId);
        return shop != null && shop.getOwner() != null && shop.getOwner().getId().equals(userId);
    }

    /**
     * Create a new shop
     * @param shop The shop entity to create
     * @param owner The user who will own the shop
     * @return The created shop with generated ID
     */
    public ShopEntity createShop(ShopEntity shop, UserEntity owner) {
        logger.info("Creating new shop: {} with owner ID: {}", shop.getName(), owner.getId());
        shop.setOwner(owner);
        shop.setCreatedAt(new java.util.Date());
        shop.setUpdatedAt(new java.util.Date());
        shop.setActive(true);
        return shopRepo.save(shop);
    }
    
    /**
     * Create a new shop
     * @param shop The shop entity to create
     * @return The created shop with generated ID
     */
    public ShopEntity createShop(ShopEntity shop) {
        logger.info("Creating new shop: {}", shop.getName());
        if (shop.getCreatedAt() == null) {
            shop.setCreatedAt(new java.util.Date());
        }
        shop.setUpdatedAt(new java.util.Date());
        return shopRepo.save(shop);
    }

    /**
     * Update an existing shop
     * @param shop The shop entity with updated fields
     * @return The updated shop
     */
    public ShopEntity updateShop(ShopEntity shop) {
        logger.info("Updating shop with ID: {}", shop.getShopId());
        shop.updateTimestamp();
        return shopRepo.save(shop);
    }

    /**
     * Soft delete a shop by setting isActive to false
     * @param id The ID of the shop to delete
     */
    public void softDeleteShop(Long id) {
        logger.info("Soft deleting shop with ID: {}", id);
        ShopEntity shop = getShopById(id);
        if (shop != null) {
            shop.setActive(false);
            shop.updateTimestamp();
            shopRepo.save(shop);
        }
    }
    
    /**
     * Hard delete a shop from the database
     * @param id The ID of the shop to delete
     */
    public void deleteShop(Long id) {
        logger.info("Hard deleting shop with ID: {}", id);
        shopRepo.deleteById(id);
    }
}
