package com.wildeats.onlinecanteen.controller;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import com.wildeats.onlinecanteen.entity.OrderEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.OrderService;
import com.wildeats.onlinecanteen.service.ShopService;
import com.wildeats.onlinecanteen.service.UserService;
import com.wildeats.onlinecanteen.dto.CreateOrderRequest;
import com.wildeats.onlinecanteen.dto.UpdateOrderStatusRequest;
import com.wildeats.onlinecanteen.dto.OrderResponse;

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
     * Global validation exception handler
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

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
     * Get all orders placed by the current user as a customer
     * (Orders they made at any shop, regardless of their seller role)
     * 
     * @return List of orders placed by user (as DTOs)
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders() {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch orders placed by user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Get orders placed by this user as a customer
        List<OrderEntity> orders = orderService.getOrdersByCustomerId(userId);
        logger.info("Found {} orders placed by user", orders.size());

        // Convert to DTOs
        List<OrderResponse> orderDTOs = orders.stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(orderDTOs);
    }

    /**
     * Get orders received for current user's shops (SELLER only)
     * (Orders that customers made at shops owned by this user)
     * 
     * @return List of orders for user's shops (as DTOs)
     */
    @GetMapping("/my-shop-orders")
    public ResponseEntity<?> getMyShopOrders() {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch shop orders for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "User does not have seller role"));
        }

        List<Long> shopIds = shopService.getShopsByOwnerId(userId).stream()
                .map(shop -> shop.getShopId())
                .toList();

        if (shopIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<OrderEntity> orders = new java.util.ArrayList<>();
        for (Long shopId : shopIds) {
            orders.addAll(orderService.getOrdersByShopId(shopId));
        }

        logger.info("Found {} orders for user's shops", orders.size());

        // Convert to DTOs
        List<OrderResponse> orderDTOs = orders.stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(orderDTOs);
    }

    /**
     * Get orders for a specific shop (SELLER only)
     * 
     * @param shopId The ID of the shop
     * @return List of orders for the shop (as DTOs)
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

        if (!user.isSeller() || !shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only view orders for your own shops"));
        }

        List<OrderEntity> orders = orderService.getOrdersByShopId(shopId);

        // Convert to DTOs
        List<OrderResponse> orderDTOs = orders.stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(orderDTOs);
    }

    /**
     * Get active orders for a shop (SELLER only)
     * 
     * @param shopId The ID of the shop
     * @return List of active orders for the shop (as DTOs)
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

        if (!user.isSeller() || !shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only view orders for your own shops"));
        }

        List<OrderEntity> orders = orderService.getActiveOrdersByShopId(shopId);

        // Convert to DTOs
        List<OrderResponse> orderDTOs = orders.stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(orderDTOs);
    }

    /**
     * Get orders with a specific status for a shop (SELLER only)
     * 
     * @param shopId The ID of the shop
     * @param status The status of the orders
     * @return List of orders with the specified status (as DTOs)
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

        if (!user.isSeller() || !shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only view orders for your own shops"));
        }

        try {
            OrderEntity.Status orderStatus = OrderEntity.Status.valueOf(status.toUpperCase());
            List<OrderEntity> orders = orderService.getOrdersByShopIdAndStatus(shopId, orderStatus);

            // Convert to DTOs
            List<OrderResponse> orderDTOs = orders.stream()
                    .map(OrderResponse::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(orderDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid status: " + status));
        }
    }

    /**
     * Get orders for current user with a specific status
     * 
     * @param status The status of the orders
     * @return List of orders with the specified status (as DTOs)
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

            // Convert to DTOs
            List<OrderResponse> orderDTOs = orders.stream()
                    .map(OrderResponse::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(orderDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid status: " + status));
        }
    }

    /**
     * Get an order by its ID
     * 
     * @param id The order ID
     * @return The order if found and the user has access to it (as DTO)
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
        boolean hasAccess = false;

        // Check if user is the customer who placed the order
        if (user.isCustomer() && orderService.isOrderOwnedByCustomer(id, userId)) {
            hasAccess = true;
        }

        // Check if user is the seller who owns the shop
        if (user.isSeller() && shopService.isShopOwnedByUser(userId, order.getShop().getShopId())) {
            hasAccess = true;
        }

        if (!hasAccess) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You do not have access to this order"));
        }

        // Convert to DTO
        OrderResponse orderDTO = new OrderResponse(order);
        return ResponseEntity.ok(orderDTO);
    }

    /**
     * Create a new order (CUSTOMER only)
     * 
     * @param request The order request containing shop ID, order items, and notes
     * @return The created order (as DTO)
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
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

            // Convert to DTO
            OrderResponse orderDTO = new OrderResponse(order);
            return ResponseEntity.status(HttpStatus.CREATED).body(orderDTO);
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
     * @return The updated order (as DTO)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
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
            } else {
                if (!user.isSeller()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "Only sellers can update order status"));
                }

                if (!shopService.isShopOwnedByUser(userId, order.getShop().getShopId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "You can only update orders for your own shops"));
                }
            }

            OrderEntity updatedOrder = orderService.updateOrderStatus(id, status);

            // Convert to DTO
            OrderResponse orderDTO = new OrderResponse(updatedOrder);
            return ResponseEntity.ok(orderDTO);
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
     * @return The cancelled order (as DTO)
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

        // Check permissions - customer can cancel their own orders, seller can cancel
        // orders at their shops
        boolean canCancel = false;

        if (user.isCustomer() && orderService.isOrderOwnedByCustomer(id, userId)) {
            canCancel = true;
            logger.info("User {} cancelling their own order {}", userId, id);
        }

        if (user.isSeller() && shopService.isShopOwnedByUser(userId, order.getShop().getShopId())) {
            canCancel = true;
            logger.info("Shop owner {} cancelling order {} for their shop", userId, id);
        }

        if (!canCancel) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only cancel your own orders or orders at your shops"));
        }

        try {
            OrderEntity cancelledOrder = orderService.cancelOrder(id, reason);

            // Convert to DTO
            OrderResponse orderDTO = new OrderResponse(cancelledOrder);
            return ResponseEntity.ok(orderDTO);
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

        if (!user.isSeller() || !shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only view revenue for your own shops"));
        }

        BigDecimal revenue = orderService.calculateRevenue(shopId, startDate, endDate);
        return ResponseEntity.ok(Map.of(
                "shopId", shopId,
                "startDate", startDate,
                "endDate", endDate,
                "revenue", revenue));
    }
}