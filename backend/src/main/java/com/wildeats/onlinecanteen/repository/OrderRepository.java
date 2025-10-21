package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.OrderEntity;
import com.wildeats.onlinecanteen.entity.OrderEntity.Status;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    /**
     * Find all orders for a specific customer
     * @param customerId The ID of the customer
     * @return List of orders for the customer
     */
    List<OrderEntity> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    
    /**
     * Find all orders for a specific shop
     * @param shopId The ID of the shop
     * @return List of orders for the shop
     */
    List<OrderEntity> findByShopShopIdOrderByCreatedAtDesc(Long shopId);
    
    /**
     * Find all orders for a specific shop with a specific status
     * @param shopId The ID of the shop
     * @param status The status of the orders
     * @return List of orders for the shop with the specified status
     */
    List<OrderEntity> findByShopShopIdAndStatusOrderByCreatedAtDesc(Long shopId, Status status);
    
    /**
     * Find all orders for a specific customer with a specific status
     * @param customerId The ID of the customer
     * @param status The status of the orders
     * @return List of orders for the customer with the specified status
     */
    List<OrderEntity> findByCustomerIdAndStatusOrderByCreatedAtDesc(Long customerId, Status status);
}
