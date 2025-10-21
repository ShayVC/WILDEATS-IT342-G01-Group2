package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.OrderItemEntity;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    /**
     * Find all order items for a specific order
     * @param orderId The ID of the order
     * @return List of order items for the order
     */
    List<OrderItemEntity> findByOrderOrderId(Long orderId);
    
    /**
     * Find all order items for a specific food item
     * @param foodItemId The ID of the food item
     * @return List of order items for the food item
     */
    List<OrderItemEntity> findByFoodItemItemId(Long foodItemId);
}
