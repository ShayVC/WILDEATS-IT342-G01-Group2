package com.wildeats.onlinecanteen.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.repository.ShopRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ShopService {

    private static final Logger logger = LoggerFactory.getLogger(ShopService.class);

    @Autowired
    private ShopRepository shopRepo;

    /*
     * ============================
     * BASIC FETCH OPERATIONS
     * ============================
     */

    public List<ShopEntity> getAllShops() {
        return shopRepo.findAll();
    }

    public List<ShopEntity> getAllOperationalShops() {
        return shopRepo.findAllOperational();
    }

    public List<ShopEntity> getShopsByStatus(ShopEntity.Status status) {
        return shopRepo.findByStatus(status);
    }

    public ShopEntity getShopById(Long id) {
        Optional<ShopEntity> shop = shopRepo.findById(id);
        return shop.orElse(null);
    }

    public List<ShopEntity> getShopsByOwnerId(Long ownerId) {
        return shopRepo.findByOwnerUserId(ownerId);
    }

    public boolean isShopOwnedByUser(Long userId, Long shopId) {
        return shopRepo.existsByShopIdAndOwnerId(shopId, userId);
    }

    /*
     * ============================
     * CREATE SHOP
     * ============================
     */

    public ShopEntity createShop(ShopEntity shop) {
        shop.setStatus(ShopEntity.Status.PENDING);
        shop.setIsOpen(false);
        shop.setCreatedAt(new Date());
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /*
     * ============================
     * UPDATE SHOP
     * ============================
     */

    public ShopEntity updateShop(ShopEntity shop) {
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /*
     * ============================
     * APPROVE SHOP
     * ============================
     */

    public ShopEntity approveShop(Long shopId) {
        ShopEntity shop = getShopById(shopId);
        if (shop == null)
            throw new IllegalArgumentException("Shop not found");

        shop.setStatus(ShopEntity.Status.ACTIVE);
        shop.setIsOpen(false);
        shop.setUpdatedAt(new Date());

        logger.info("Shop {} approved", shopId);

        return shopRepo.save(shop);
    }

    /*
     * ============================
     * REJECT SHOP (NEW)
     * ============================
     */

    public ShopEntity rejectShop(Long shopId) {
        ShopEntity shop = getShopById(shopId);
        if (shop == null)
            throw new IllegalArgumentException("Shop not found");

        shop.setStatus(ShopEntity.Status.REJECTED);
        shop.setIsOpen(false);
        shop.setUpdatedAt(new Date());

        logger.info("Shop {} rejected", shopId);

        return shopRepo.save(shop);
    }

    /*
     * ============================
     * SUSPEND SHOP
     * ============================
     */

    public ShopEntity suspendShop(Long shopId) {
        ShopEntity shop = getShopById(shopId);
        if (shop == null)
            throw new IllegalArgumentException("Shop not found");

        shop.setStatus(ShopEntity.Status.SUSPENDED);
        shop.setIsOpen(false);
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /*
     * ============================
     * CLOSE SHOP
     * ============================
     */

    public ShopEntity closeShop(Long shopId) {
        ShopEntity shop = getShopById(shopId);
        if (shop == null)
            throw new IllegalArgumentException("Shop not found");

        shop.setStatus(ShopEntity.Status.CLOSED);
        shop.setIsOpen(false);
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /*
     * ============================
     * TOGGLE OPEN/CLOSE
     * ============================
     */

    public ShopEntity toggleShopOpenStatus(Long shopId) {
        ShopEntity shop = getShopById(shopId);
        if (shop == null)
            throw new IllegalArgumentException("Shop not found");

        if (shop.getStatus() != ShopEntity.Status.ACTIVE) {
            throw new IllegalStateException("Only active shops can be opened/closed");
        }

        shop.setIsOpen(!shop.getIsOpen());
        shop.setUpdatedAt(new Date());
        return shopRepo.save(shop);
    }

    /*
     * ============================
     * SOFT DELETE
     * ============================
     */

    public void softDeleteShop(Long shopId) {
        ShopEntity shop = getShopById(shopId);
        if (shop == null)
            throw new IllegalArgumentException("Shop not found");

        shop.setStatus(ShopEntity.Status.CLOSED);
        shop.setIsOpen(false);
        shop.setUpdatedAt(new Date());
        shopRepo.save(shop);
    }

    /*
     * ============================
     * HARD DELETE
     * ============================
     */

    public void deleteShop(Long shopId) {
        shopRepo.deleteById(shopId);
    }
}
