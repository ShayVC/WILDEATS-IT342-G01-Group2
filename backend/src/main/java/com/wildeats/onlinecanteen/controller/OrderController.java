package com.wildeats.onlinecanteen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wildeats.onlinecanteen.entity.OrderEntity;
import com.wildeats.onlinecanteen.entity.OrderItemEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.OrderService;
import com.wildeats.onlinecanteen.service.ShopService;
import com.wildeats.onlinecanteen.service.UserService;
import com.wildeats.onlinecanteen.dto.CreateOrderRequest;
import com.wildeats.onlinecanteen.dto.UpdateOrderStatusRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ShopService shopService;
    
    @Autowired
    private UserService userService;

    /**
     * Get all orders for the current user
     * @param userId The ID of the current user
     * @return List of orders for the user
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@RequestParam Long userId) {
        logger.info("GET request to fetch orders for user with ID: {}", userId);
        
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        List<OrderEntity> orders;
        if (user.isSeller()) {
            // For sellers, get orders for their shops
            List<Long> shopIds = shopService.getShopsByOwnerId(userId).stream()
                .map(shop -> shop.getShopId())
                .toList();
            
            // If the seller has no shops, return an empty list
            if (shopIds.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            
            // Get orders for all shops owned by the seller
            orders = new java.util.ArrayList<>();
            for (Long shopId : shopIds) {
                orders.addAll(orderService.getOrdersByShopId(shopId));
            }
        } else {
            // For customers, get their orders
            orders = orderService.getOrdersByCustomerId(userId);
        }
        
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get orders for a specific shop
     * @param shopId The ID of the shop
     * @param userId The ID of the current user
     * @return List of orders for the shop
     */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getOrdersByShop(
            @PathVariable Long shopId,
            @RequestParam Long userId) {
        logger.info("GET request to fetch orders for shop with ID: {} from user with ID: {}", shopId, userId);
        
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        // Check if the user is a seller and owns the shop
        if (!user.isSeller() || !shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only view orders for your own shops"));
        }
        
        List<OrderEntity> orders = orderService.getOrdersByShopId(shopId);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get orders with a specific status for a shop
     * @param shopId The ID of the shop
     * @param status The status of the orders
     * @param userId The ID of the current user
     * @return List of orders with the specified status for the shop
     */
    @GetMapping("/shop/{shopId}/status/{status}")
    public ResponseEntity<?> getOrdersByShopAndStatus(
            @PathVariable Long shopId,
            @PathVariable String status,
            @RequestParam Long userId) {
        logger.info("GET request to fetch orders for shop with ID: {} with status: {} from user with ID: {}", 
                shopId, status, userId);
        
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        // Check if the user is a seller and owns the shop
        if (!user.isSeller() || !shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only view orders for your own shops"));
        }
        
        try {
            OrderEntity.Status orderStatus = OrderEntity.Status.valueOf(status.toUpperCase());
            List<OrderEntity> orders = orderService.getOrdersByShopIdAndStatus(shopId, orderStatus);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid status: " + status));
        }
    }

    /**
     * Get an order by its ID
     * @param id The order ID
     * @param userId The ID of the current user
     * @return The order if found and the user has access to it
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        logger.info("GET request to fetch order with ID: {} from user with ID: {}", id, userId);
        
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        OrderEntity order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Order not found"));
        }
        
        // Check if the user has access to the order
        if (user.isSeller()) {
            // Sellers can only view orders for their shops
            if (!shopService.isShopOwnedByUser(userId, order.getShop().getShopId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only view orders for your own shops"));
            }
        } else {
            // Customers can only view their own orders
            if (!orderService.isOrderOwnedByCustomer(id, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only view your own orders"));
            }
        }
        
        return ResponseEntity.ok(order);
    }

    /**
     * Create a new order
     * @param request The order request containing shop ID, order items, and notes
     * @param userId The ID of the current user
     * @return The created order
     */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequest request,
            @RequestParam Long userId) {
        logger.info("POST request to create a new order for user with ID: {}", userId);
        
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        // Only customers can create orders
        if (!user.isCustomer()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Only customers can create orders"));
        }
        
        try {
            OrderEntity order = orderService.createOrder(
                    userId, 
                    request.getShopId(), 
                    request.getOrderItems(), 
                    request.getNotes());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update the status of an order
     * @param id The order ID
     * @param request The request containing the new status
     * @param userId The ID of the current user
     * @return The updated order
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request,
            @RequestParam Long userId) {
        logger.info("PUT request to update status for order with ID: {} to {} from user with ID: {}", 
                id, request.getStatus(), userId);
        
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        OrderEntity order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Order not found"));
        }
        
        try {
            OrderEntity.Status status = OrderEntity.Status.valueOf(request.getStatus().toUpperCase());
            
            // Check permissions based on the requested status change
            if (status == OrderEntity.Status.CANCELLED) {
                // Both customers and sellers can cancel orders
                if (user.isCustomer()) {
                    // Customers can only cancel their own orders
                    if (!orderService.isOrderOwnedByCustomer(id, userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "You can only cancel your own orders"));
                    }
                } else if (user.isSeller()) {
                    // Sellers can only cancel orders for their shops
                    if (!shopService.isShopOwnedByUser(userId, order.getShop().getShopId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "You can only cancel orders for your own shops"));
                    }
                }
            } else {
                // Only sellers can update order status to other values
                if (!user.isSeller()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Only sellers can update order status"));
                }
                
                // Sellers can only update orders for their shops
                if (!shopService.isShopOwnedByUser(userId, order.getShop().getShopId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only update orders for your own shops"));
                }
            }
            
            OrderEntity updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        }
    }
}
