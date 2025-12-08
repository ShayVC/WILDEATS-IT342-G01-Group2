package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.OrderEntity;
import com.wildeats.onlinecanteen.entity.OrderEntity.Status;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
        /**
         * Find all orders for a specific customer, ordered by creation date (newest
         * first)
         * 
         * @param customerId The ID of the customer
         * @return List of orders for the customer
         */
        List<OrderEntity> findByCustomerUserIdOrderByOrderDateTimeDesc(Long customerId);

        /**
         * Find all orders for a specific shop, ordered by creation date (newest first)
         * 
         * @param shopId The ID of the shop
         * @return List of orders for the shop
         */
        List<OrderEntity> findByShopShopIdOrderByOrderDateTimeDesc(Long shopId);

        /**
         * Find all orders for a specific shop with a specific status
         * 
         * @param shopId The ID of the shop
         * @param status The status of the orders
         * @return List of orders for the shop with the specified status
         */
        List<OrderEntity> findByShopShopIdAndStatusOrderByOrderDateTimeDesc(Long shopId, Status status);

        /**
         * Find all orders for a specific customer with a specific status
         * 
         * @param customerId The ID of the customer
         * @param status     The status of the orders
         * @return List of orders for the customer with the specified status
         */
        List<OrderEntity> findByCustomerUserIdAndStatusOrderByOrderDateTimeDesc(Long customerId, Status status);

        /**
         * Find an order by its queue number and shop
         * 
         * @param queueNumber The queue number
         * @param shopId      The ID of the shop
         * @return Optional containing the order if found
         */
        Optional<OrderEntity> findByQueueNumberAndShopShopId(Integer queueNumber, Long shopId);

        /**
         * Get the maximum queue number for a shop on a specific date
         * 
         * @param shopId    The ID of the shop
         * @param startDate The start of the date range
         * @param endDate   The end of the date range
         * @return The maximum queue number, or null if no orders exist
         */
        @Query("SELECT MAX(o.queueNumber) FROM OrderEntity o WHERE o.shop.shopId = :shopId AND o.orderDateTime BETWEEN :startDate AND :endDate")
        Integer findMaxQueueNumberForShopAndDate(@Param("shopId") Long shopId, @Param("startDate") Date startDate,
                        @Param("endDate") Date endDate);

        /**
         * Find all orders for a shop that are currently active (not completed or
         * cancelled)
         * 
         * @param shopId The ID of the shop
         * @return List of active orders
         */
        @Query("SELECT o FROM OrderEntity o WHERE o.shop.shopId = :shopId AND o.status NOT IN ('COMPLETED', 'CANCELLED') ORDER BY o.queueNumber ASC")
        List<OrderEntity> findActiveOrdersByShopId(@Param("shopId") Long shopId);

        /**
         * Count orders by status for a specific shop
         * 
         * @param shopId The ID of the shop
         * @param status The status to count
         * @return Count of orders with the specified status
         */
        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.shop.shopId = :shopId AND o.status = :status")
        long countByShopIdAndStatus(@Param("shopId") Long shopId, @Param("status") Status status);

        /**
         * Find orders within a date range for a specific shop
         * 
         * @param shopId    The ID of the shop
         * @param startDate The start date
         * @param endDate   The end date
         * @return List of orders within the date range
         */
        @Query("SELECT o FROM OrderEntity o WHERE o.shop.shopId = :shopId AND o.orderDateTime BETWEEN :startDate AND :endDate ORDER BY o.orderDateTime DESC")
        List<OrderEntity> findByShopIdAndDateRange(@Param("shopId") Long shopId, @Param("startDate") Date startDate,
                        @Param("endDate") Date endDate);

        /**
         * Calculate total revenue for a shop within a date range
         * 
         * @param shopId    The ID of the shop
         * @param startDate The start date
         * @param endDate   The end date
         * @return Total revenue
         */
        @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o WHERE o.shop.shopId = :shopId AND o.status = 'COMPLETED' AND o.orderDateTime BETWEEN :startDate AND :endDate")
        BigDecimal calculateRevenueForShopAndDateRange(@Param("shopId") Long shopId, @Param("startDate") Date startDate,
                        @Param("endDate") Date endDate);
}