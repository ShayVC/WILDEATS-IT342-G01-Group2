package com.wildeats.onlinecanteen.service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wildeats.onlinecanteen.entity.OrderEntity;
import com.wildeats.onlinecanteen.entity.OrderItemEntity;
import com.wildeats.onlinecanteen.entity.FoodItemEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.repository.OrderRepository;
import com.wildeats.onlinecanteen.repository.OrderItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepo;
    
    @Autowired
    private OrderItemRepository orderItemRepo;
    
    @Autowired
    private FoodItemService foodItemService;
    
    @Autowired
    private ShopService shopService;
    
    @Autowired
    private UserService userService;

    /**
     * Get all orders
     * @return List of all orders
     */
    public List<OrderEntity> getAllOrders() {
        logger.info("Fetching all orders");
        return orderRepo.findAll();
    }

    /**
     * Get an order by its ID
     * @param id The order ID
     * @return The order if found, null otherwise
     */
    public OrderEntity getOrderById(Long id) {
        logger.info("Fetching order with ID: {}", id);
        Optional<OrderEntity> order = orderRepo.findById(id);
        return order.orElse(null);
    }
    
    /**
     * Get all orders for a specific customer
     * @param customerId The ID of the customer
     * @return List of orders for the customer
     */
    public List<OrderEntity> getOrdersByCustomerId(Long customerId) {
        logger.info("Fetching orders for customer with ID: {}", customerId);
        return orderRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }
    
    /**
     * Get all orders for a specific shop
     * @param shopId The ID of the shop
     * @return List of orders for the shop
     */
    public List<OrderEntity> getOrdersByShopId(Long shopId) {
        logger.info("Fetching orders for shop with ID: {}", shopId);
        return orderRepo.findByShopShopIdOrderByCreatedAtDesc(shopId);
    }
    
    /**
     * Get all orders for a specific shop with a specific status
     * @param shopId The ID of the shop
     * @param status The status of the orders
     * @return List of orders for the shop with the specified status
     */
    public List<OrderEntity> getOrdersByShopIdAndStatus(Long shopId, OrderEntity.Status status) {
        logger.info("Fetching orders for shop with ID: {} and status: {}", shopId, status);
        return orderRepo.findByShopShopIdAndStatusOrderByCreatedAtDesc(shopId, status);
    }
    
    /**
     * Get all orders for a specific customer with a specific status
     * @param customerId The ID of the customer
     * @param status The status of the orders
     * @return List of orders for the customer with the specified status
     */
    public List<OrderEntity> getOrdersByCustomerIdAndStatus(Long customerId, OrderEntity.Status status) {
        logger.info("Fetching orders for customer with ID: {} and status: {}", customerId, status);
        return orderRepo.findByCustomerIdAndStatusOrderByCreatedAtDesc(customerId, status);
    }

    /**
     * Create a new order
     * @param customerId The ID of the customer placing the order
     * @param shopId The ID of the shop the order is being placed at
     * @param orderItems List of order items
     * @param notes Any notes for the order
     * @return The created order
     */
    @Transactional
    public OrderEntity createOrder(Long customerId, Long shopId, List<OrderItemEntity> orderItems, String notes) {
        logger.info("Creating new order for customer with ID: {} at shop with ID: {}", customerId, shopId);
        
        UserEntity customer = userService.getUserById(customerId);
        if (customer == null) {
            logger.error("Customer with ID {} not found", customerId);
            throw new IllegalArgumentException("Customer not found");
        }
        
        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null) {
            logger.error("Shop with ID {} not found", shopId);
            throw new IllegalArgumentException("Shop not found");
        }
        
        // Create the order
        OrderEntity order = new OrderEntity();
        order.setCustomer(customer);
        order.setShop(shop);
        order.setStatus(OrderEntity.Status.PENDING);
        order.setNotes(notes);
        order.setCreatedAt(new java.util.Date());
        order.setUpdatedAt(new java.util.Date());
        
        // Add order items and decrease food item quantities
        for (OrderItemEntity item : orderItems) {
            FoodItemEntity foodItem = foodItemService.getFoodItemById(item.getFoodItem().getItemId());
            if (foodItem == null) {
                logger.error("Food item with ID {} not found", item.getFoodItem().getItemId());
                throw new IllegalArgumentException("Food item not found");
            }
            
            // Check if food item belongs to the shop
            if (!foodItemService.isFoodItemInShop(foodItem.getItemId(), shopId)) {
                logger.error("Food item with ID {} does not belong to shop with ID {}", 
                        foodItem.getItemId(), shopId);
                throw new IllegalArgumentException("Food item does not belong to the shop");
            }
            
            // Check if there's enough quantity
            if (foodItem.getQuantity() < item.getQuantity()) {
                logger.error("Not enough quantity for food item with ID: {}", foodItem.getItemId());
                throw new IllegalArgumentException("Not enough quantity for " + foodItem.getName());
            }
            
            // Set the food item and price
            item.setFoodItem(foodItem);
            item.setPrice(foodItem.getPrice());
            item.setQuantity(item.getQuantity());
            
            // Add to order
            order.addOrderItem(item);
            
            // Decrease food item quantity
            foodItemService.decreaseFoodItemQuantity(foodItem.getItemId(), item.getQuantity());
        }
        
        // Calculate total amount
        order.calculateTotalAmount();
        
        // Save the order
        OrderEntity savedOrder = orderRepo.save(order);
        
        logger.info("Order created with ID: {}", savedOrder.getOrderId());
        return savedOrder;
    }

    /**
     * Update the status of an order
     * @param orderId The ID of the order
     * @param status The new status
     * @return The updated order
     */
    @Transactional
    public OrderEntity updateOrderStatus(Long orderId, OrderEntity.Status status) {
        logger.info("Updating status for order with ID: {} to {}", orderId, status);
        
        OrderEntity order = getOrderById(orderId);
        if (order == null) {
            logger.error("Order with ID {} not found", orderId);
            throw new IllegalArgumentException("Order not found");
        }
        
        // If cancelling an order, restore food item quantities
        if (status == OrderEntity.Status.CANCELLED && order.getStatus() != OrderEntity.Status.CANCELLED) {
            for (OrderItemEntity item : order.getOrderItems()) {
                FoodItemEntity foodItem = item.getFoodItem();
                foodItem.increaseQuantity(item.getQuantity());
                foodItemService.updateFoodItem(foodItem);
            }
        }
        
        order.setStatus(status);
        order.updateTimestamp();
        
        return orderRepo.save(order);
    }

    /**
     * Cancel an order
     * @param orderId The ID of the order to cancel
     * @return The cancelled order
     */
    @Transactional
    public OrderEntity cancelOrder(Long orderId) {
        logger.info("Cancelling order with ID: {}", orderId);
        return updateOrderStatus(orderId, OrderEntity.Status.CANCELLED);
    }
    
    /**
     * Check if an order belongs to a specific customer
     * @param orderId The ID of the order
     * @param customerId The ID of the customer
     * @return true if the order belongs to the customer, false otherwise
     */
    public boolean isOrderOwnedByCustomer(Long orderId, Long customerId) {
        OrderEntity order = getOrderById(orderId);
        return order != null && order.getCustomer() != null && 
               order.getCustomer().getId().equals(customerId);
    }
    
    /**
     * Check if an order is from a specific shop
     * @param orderId The ID of the order
     * @param shopId The ID of the shop
     * @return true if the order is from the shop, false otherwise
     */
    public boolean isOrderFromShop(Long orderId, Long shopId) {
        OrderEntity order = getOrderById(orderId);
        return order != null && order.getShop() != null && 
               order.getShop().getShopId().equals(shopId);
    }
}
