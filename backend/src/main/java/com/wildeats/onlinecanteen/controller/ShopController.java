package com.wildeats.onlinecanteen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.ShopService;
import com.wildeats.onlinecanteen.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class ShopController {
    private static final Logger logger = LoggerFactory.getLogger(ShopController.class);

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
     * Get all operational shops (PUBLIC - no auth required)
     * 
     * @return List of all operational shops (ACTIVE and open)
     */
    @GetMapping
    public ResponseEntity<?> getAllShops() {
        logger.info("GET request to fetch all operational shops");
        List<ShopEntity> shops = shopService.getAllOperationalShops();
        return ResponseEntity.ok(shops);
    }

    /**
     * Get all shops with a specific status (PUBLIC)
     * 
     * @param status The status to filter by
     * @return List of shops with the specified status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getShopsByStatus(@PathVariable String status) {
        logger.info("GET request to fetch shops with status: {}", status);

        try {
            ShopEntity.Status shopStatus = ShopEntity.Status.valueOf(status.toUpperCase());
            List<ShopEntity> shops = shopService.getShopsByStatus(shopStatus);
            return ResponseEntity.ok(shops);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid status: " + status));
        }
    }

    /**
     * Get a shop by its ID (PUBLIC - no auth required)
     * 
     * @param id The shop ID
     * @return The shop if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getShopById(@PathVariable Long id) {
        logger.info("GET request to fetch shop with ID: {}", id);

        ShopEntity shop = shopService.getShopById(id);
        if (shop != null && shop.getStatus() == ShopEntity.Status.ACTIVE) {
            return ResponseEntity.ok(shop);
        } else if (shop != null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Shop is not currently active"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }
    }

    /**
     * Get shops owned by the current user (SELLER only)
     * 
     * @return List of shops owned by the user
     */
    @GetMapping("/my-shops")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> getMyShops() {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch shops for user with ID: {}", userId);

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
                    .body(Map.of("message", "Only sellers can access their shops"));
        }

        List<ShopEntity> shops = shopService.getShopsByOwnerId(userId);
        return ResponseEntity.ok(shops);
    }

    /**
     * Create a new shop (SELLER only)
     * 
     * @param shop The shop to create
     * @return The created shop
     */
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> createShop(@RequestBody ShopEntity shop) {
        Long userId = getCurrentUserId();
        logger.info("POST request to create a new shop from user with ID: {}", userId);

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
                    .body(Map.of("message", "Only sellers can create shops"));
        }

        // Validate shop data
        if (shop.getShopName() == null || shop.getShopName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Shop name is required"));
        }

        ShopEntity createdShop = shopService.createShop(shop, user);
        logger.info("Shop created with ID: {} and status: {}", createdShop.getShopId(), createdShop.getStatus());

        return ResponseEntity.status(HttpStatus.CREATED).body(createdShop);
    }

    /**
     * Update an existing shop (SELLER only - must own the shop)
     * 
     * @param id   The shop ID
     * @param shop The updated shop data
     * @return The updated shop
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> updateShop(
            @PathVariable Long id,
            @RequestBody ShopEntity shop) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to update shop with ID: {} from user with ID: {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Check if the shop exists
        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        // Check if the user is the owner of the shop
        if (!shopService.isShopOwnedByUser(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only update your own shops"));
        }

        // Validate shop data
        if (shop.getShopName() != null && shop.getShopName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Shop name cannot be empty"));
        }

        // Update shop properties but keep the owner, status, and creation date
        shop.setShopId(id);
        shop.setOwner(existingShop.getOwner());
        shop.setStatus(existingShop.getStatus()); // Status can only be changed by admin
        shop.setCreatedAt(existingShop.getCreatedAt());

        // If shop name is not provided, keep the existing one
        if (shop.getShopName() == null) {
            shop.setShopName(existingShop.getShopName());
        }

        ShopEntity updatedShop = shopService.updateShop(shop);
        return ResponseEntity.ok(updatedShop);
    }

    /**
     * Toggle shop open/closed status (SELLER only)
     * 
     * @param id The shop ID
     * @return The updated shop
     */
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> toggleShopStatus(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to toggle status for shop with ID: {} from user with ID: {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        // Check if the shop exists
        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        // Check if the user is the owner of the shop
        if (!shopService.isShopOwnedByUser(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only toggle status for your own shops"));
        }

        try {
            ShopEntity updatedShop = shopService.toggleShopOpenStatus(id);
            return ResponseEntity.ok(updatedShop);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Soft delete a shop (SELLER only)
     * 
     * @param id The shop ID
     * @return Success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> deleteShop(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("DELETE request for shop with ID: {} from user with ID: {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        // Check if the shop exists
        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        // Check if the user is the owner of the shop
        if (!shopService.isShopOwnedByUser(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only delete your own shops"));
        }

        // Soft delete the shop (set status to CLOSED)
        shopService.softDeleteShop(id);
        return ResponseEntity.ok(Map.of("message", "Shop deleted successfully"));
    }

    // ============================================
    // ADMIN ENDPOINTS
    // ============================================

    /**
     * Get all shops (any status) - ADMIN only
     * 
     * @return List of all shops
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllShopsAdmin() {
        logger.info("Admin fetching all shops");
        List<ShopEntity> shops = shopService.getAllShops();
        return ResponseEntity.ok(shops);
    }

    /**
     * Approve a shop - ADMIN only
     * 
     * @param id The shop ID
     * @return The approved shop
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveShop(@PathVariable Long id) {
        logger.info("Admin approving shop with ID: {}", id);

        ShopEntity shop = shopService.getShopById(id);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        try {
            ShopEntity approvedShop = shopService.approveShop(id);
            return ResponseEntity.ok(approvedShop);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Suspend a shop - ADMIN only
     * 
     * @param id The shop ID
     * @return The suspended shop
     */
    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> suspendShop(@PathVariable Long id) {
        logger.info("Admin suspending shop with ID: {}", id);

        ShopEntity shop = shopService.getShopById(id);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        try {
            ShopEntity suspendedShop = shopService.suspendShop(id);
            return ResponseEntity.ok(suspendedShop);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Permanently close a shop - ADMIN only
     * 
     * @param id The shop ID
     * @return The closed shop
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> closeShop(@PathVariable Long id) {
        logger.info("Admin closing shop with ID: {}", id);

        ShopEntity shop = shopService.getShopById(id);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        try {
            ShopEntity closedShop = shopService.closeShop(id);
            return ResponseEntity.ok(closedShop);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}