package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity.Status;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopRepository extends JpaRepository<ShopEntity, Long> {

    /**
     * Find all shops with a specific status
     * 
     * @param status The status of the shops
     * @return List of shops with the specified status
     */
    List<ShopEntity> findByStatus(Status status);

    /**
     * Find all shops with ACTIVE status and isOpen = true
     * 
     * @return List of operational shops
     */
    @Query("SELECT s FROM ShopEntity s WHERE s.status = 'ACTIVE' AND s.isOpen = true")
    List<ShopEntity> findAllOperational();

    /**
     * Find all shops owned by a specific user with a specific status
     * 
     * @param ownerId The ID of the shop owner
     * @param status  The status of the shops
     * @return List of shops owned by the user with the specified status
     */
    List<ShopEntity> findByOwnerUserIdAndStatus(Long ownerId, Status status);

    /**
     * Find all shops owned by a specific user (any status)
     * 
     * @param ownerId The ID of the shop owner
     * @return List of shops owned by the user
     */
    List<ShopEntity> findByOwnerUserId(Long ownerId);

    /**
     * Find a shop by its name
     * 
     * @param shopName The name of the shop
     * @return Optional containing the shop if found
     */
    Optional<ShopEntity> findByShopName(String shopName);

    /**
     * Check if a user owns a specific shop
     * 
     * @param shopId  The ID of the shop
     * @param ownerId The ID of the owner
     * @return true if the user owns the shop, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM ShopEntity s WHERE s.shopId = :shopId AND s.owner.userId = :ownerId")
    boolean existsByShopIdAndOwnerId(@Param("shopId") Long shopId, @Param("ownerId") Long ownerId);
}