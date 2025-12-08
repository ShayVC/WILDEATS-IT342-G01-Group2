package com.wildeats.onlinecanteen.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity.Status;
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
     * 
     * @return List of all active shops
     */
    public List<ShopEntity> getAllShops() {
        logger.info("Fetching all shops (all statuses)");
        return shopRepo.findAll();
    }

    /**
     * Get all operational shops (ACTIVE and open)
     * 
     * @return List of operational shops
     */
    public List<ShopEntity> getAllOperationalShops() {
        logger.info("Fetching all operational shops");
        return shopRepo.findAllOperational();
    }

    /**
     * Get all shops with a specific status
     * 
     * @param status The status to filter by
     * @return List of shops with the specified status
     */
    public List<ShopEntity> getShopsByStatus(Status status) {
        logger.info("Fetching shops with status: {}", status);
        return shopRepo.findByStatus(status);
    }

    /**
     * Get a shop by its ID
     * 
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
     * 
     * @param userId The ID of the shop owner
     * @return List of shops owned by the user
     */
    public List<ShopEntity> getShopsByOwnerId(Long userId) {
        logger.info("Fetching shops for owner with ID: {}", userId);
        return shopRepo.findByOwnerUserId(userId);
    }

    /**
     * Get all active shops owned by a specific user
     * 
     * @param userId The ID of the shop owner
     * @return List of active shops owned by the user
     */
    public List<ShopEntity> getActiveShopsByOwnerId(Long userId) {
        logger.info("Fetching active shops for owner with ID: {}", userId);
        return shopRepo.findByOwnerUserIdAndStatus(userId, Status.ACTIVE);
    }

    /**
     * Check if a user owns a specific shop
     * 
     * @param userId The ID of the user
     * @param shopId The ID of the shop
     * @return true if the user owns the shop, false otherwise
     */
    public boolean isShopOwnedByUser(Long userId, Long shopId) {
        return shopRepo.existsByShopIdAndOwnerId(shopId, userId);
    }

    /**
     * Create a new shop
     * 
     * @param shop  The shop entity to create
     * @param owner The user who will own the shop
     * @return The created shop with generated ID
     */
    public ShopEntity createShop(ShopEntity shop, UserEntity owner) {
        logger.info("Creating new shop: {} with owner ID: {}", shop.getShopName(), owner.getUserId());
        shop.setOwner(owner);
        shop.setStatus(Status.PENDING); // New shops start as PENDING for admin approval
        shop.setIsOpen(false); // New shops are closed until approved
        shop.setCreatedAt(new Date());
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /**
     * Create a new shop (assumes owner is already set)
     * 
     * @param shop The shop entity to create
     * @return The created shop with generated ID
     */
    public ShopEntity createShop(ShopEntity shop) {
        logger.info("Creating new shop: {}", shop.getShopName());
        if (shop.getCreatedAt() == null) {
            shop.setCreatedAt(new Date());
        }
        if (shop.getStatus() == null) {
            shop.setStatus(Status.PENDING);
        }
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /**
     * Update an existing shop
     * 
     * @param shop The shop entity with updated fields
     * @return The updated shop
     */
    public ShopEntity updateShop(ShopEntity shop) {
        logger.info("Updating shop with ID: {}", shop.getShopId());
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /**
     * Approve a shop (set status to ACTIVE)
     * 
     * @param shopId The ID of the shop to approve
     * @return The approved shop
     */
    public ShopEntity approveShop(Long shopId) {
        logger.info("Approving shop with ID: {}", shopId);
        ShopEntity shop = getShopById(shopId);
        if (shop == null) {
            throw new IllegalArgumentException("Shop not found");
        }
        shop.setStatus(Status.ACTIVE);
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /**
     * Suspend a shop
     * 
     * @param shopId The ID of the shop to suspend
     * @return The suspended shop
     */
    public ShopEntity suspendShop(Long shopId) {
        logger.info("Suspending shop with ID: {}", shopId);
        ShopEntity shop = getShopById(shopId);
        if (shop == null) {
            throw new IllegalArgumentException("Shop not found");
        }
        shop.setStatus(Status.SUSPENDED);
        shop.setIsOpen(false);
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /**
     * Close a shop permanently
     * 
     * @param shopId The ID of the shop to close
     * @return The closed shop
     */
    public ShopEntity closeShop(Long shopId) {
        logger.info("Closing shop with ID: {}", shopId);
        ShopEntity shop = getShopById(shopId);
        if (shop == null) {
            throw new IllegalArgumentException("Shop not found");
        }
        shop.setStatus(Status.CLOSED);
        shop.setIsOpen(false);
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /**
     * Toggle shop open/closed status
     * 
     * @param shopId The ID of the shop
     * @return The updated shop
     */
    public ShopEntity toggleShopOpenStatus(Long shopId) {
        logger.info("Toggling open status for shop with ID: {}", shopId);
        ShopEntity shop = getShopById(shopId);
        if (shop == null) {
            throw new IllegalArgumentException("Shop not found");
        }

        // Only ACTIVE shops can be toggled open/closed
        if (shop.getStatus() != Status.ACTIVE) {
            throw new IllegalStateException("Only active shops can be opened or closed");
        }

        shop.setIsOpen(!shop.getIsOpen());
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /**
     * Soft delete a shop by setting status to CLOSED
     * 
     * @param id The ID of the shop to delete
     */
    public void softDeleteShop(Long id) {
        logger.info("Soft deleting shop with ID: {}", id);
        closeShop(id);
    }

    /**
     * Hard delete a shop from the database
     * 
     * @param id The ID of the shop to delete
     */
    public void deleteShop(Long id) {
        logger.info("Hard deleting shop with ID: {}", id);
        shopRepo.deleteById(id);
    }
}