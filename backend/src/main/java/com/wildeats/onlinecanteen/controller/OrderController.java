package com.wildeats.onlinecanteen.controller;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.wildeats.onlinecanteen.entity.OrderEntity;
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
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    @Autowired
    private ShopService shopService;

    @Autowired
    private UserService userService;

    /**
     * Helper method to get current user ID from JWT token
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            return (Long) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * Get all orders for the current user (customer or seller)
     * 
     * @return List of orders for the user
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders() {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch orders for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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
     * Get orders for a specific shop (SELLER only)
     * 
     * @param shopId The ID of the shop
     * @return List of orders for the shop
     */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getOrdersByShop(@PathVariable Long shopId) {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch orders for shop with ID: {} from user with ID: {}", shopId, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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
     * Get active orders for a shop (SELLER only)
     * 
     * @param shopId The ID of the shop
     * @return List of active orders for the shop
     */
    @GetMapping("/shop/{shopId}/active")
    public ResponseEntity<?> getActiveOrdersByShop(@PathVariable Long shopId) {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch active orders for shop with ID: {} from user with ID: {}", shopId, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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

        List<OrderEntity> orders = orderService.getActiveOrdersByShopId(shopId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get orders with a specific status for a shop (SELLER only)
     * 
     * @param shopId The ID of the shop
     * @param status The status of the orders
     * @return List of orders with the specified status for the shop
     */
    @GetMapping("/shop/{shopId}/status/{status}")
    public ResponseEntity<?> getOrdersByShopAndStatus(
            @PathVariable Long shopId,
            @PathVariable String status) {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch orders for shop with ID: {} with status: {} from user with ID: {}",
                shopId, status, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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
     * Get orders for current user with a specific status
     * 
     * @param status The status of the orders
     * @return List of orders with the specified status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getMyOrdersByStatus(@PathVariable String status) {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch orders with status: {} for user with ID: {}", status, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        try {
            OrderEntity.Status orderStatus = OrderEntity.Status.valueOf(status.toUpperCase());
            List<OrderEntity> orders = orderService.getOrdersByCustomerIdAndStatus(userId, orderStatus);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid status: " + status));
        }
    }

    /**
     * Get an order by its ID
     * 
     * @param id The order ID
     * @return The order if found and the user has access to it
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch order with ID: {} from user with ID: {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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
     * Create a new order (CUSTOMER only)
     * 
     * @param request The order request containing shop ID, order items, and notes
     * @return The created order
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        Long userId = getCurrentUserId();
        logger.info("POST request to create a new order for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update the status of an order
     * 
     * @param id      The order ID
     * @param request The request containing the new status
     * @return The updated order
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to update status for order with ID: {} to {} from user with ID: {}",
                id, request.getStatus(), userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Cancel an order with a reason
     * 
     * @param id     The order ID
     * @param reason The cancellation reason
     * @return The cancelled order
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Long userId = getCurrentUserId();
        String reason = request.getOrDefault("reason", "No reason provided");

        logger.info("POST request to cancel order with ID: {} from user with ID: {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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

        // Check permissions
        if (user.isCustomer()) {
            if (!orderService.isOrderOwnedByCustomer(id, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only cancel your own orders"));
            }
        } else if (user.isSeller()) {
            if (!shopService.isShopOwnedByUser(userId, order.getShop().getShopId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only cancel orders for your own shops"));
            }
        }

        try {
            OrderEntity cancelledOrder = orderService.cancelOrder(id, reason);
            return ResponseEntity.ok(cancelledOrder);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get revenue for a shop within a date range (SELLER only)
     * 
     * @param shopId    The ID of the shop
     * @param startDate The start date
     * @param endDate   The end date
     * @return Revenue amount
     */
    @GetMapping("/shop/{shopId}/revenue")
    public ResponseEntity<?> getShopRevenue(
            @PathVariable Long shopId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        Long userId = getCurrentUserId();
        logger.info("GET request for revenue of shop {} between {} and {} from user {}",
                shopId, startDate, endDate, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Check if the user is a seller and owns the shop
        if (!user.isSeller() || !shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only view revenue for your own shops"));
        }

        Double revenue = orderService.calculateRevenue(shopId, startDate, endDate);
        return ResponseEntity.ok(Map.of(
                "shopId", shopId,
                "startDate", startDate,
                "endDate", endDate,
                "revenue", revenue));
    }
}