package com.wildeats.onlinecanteen.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.ShopService;
import com.wildeats.onlinecanteen.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/shop")
public class ShopController {
    private static final Logger logger = LoggerFactory.getLogger(ShopController.class);

    @Autowired
    private ShopService shopService;
    
    @Autowired
    private UserService userService;

    /**
     * Get all shops
     * @return List of all active shops
     */
    @GetMapping
    public ResponseEntity<List<ShopEntity>> getAllShops() {
        logger.info("GET request to fetch all shops");
        return ResponseEntity.ok(shopService.getAllShops());
    }

    /**
     * Get a shop by its ID
     * @param id The shop ID
     * @return The shop if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getShopById(@PathVariable Long id) {
        logger.info("GET request to fetch shop with ID: {}", id);
        ShopEntity shop = shopService.getShopById(id);
        if (shop != null && shop.isActive()) {
            return ResponseEntity.ok(shop);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Shop not found or inactive"));
        }
    }
    
    /**
     * Get shops owned by the current user
     * @param userId The ID of the current user
     * @return List of shops owned by the user
     */
    @GetMapping("/my-shops")
    public ResponseEntity<?> getMyShops(@RequestParam Long userId) {
        logger.info("GET request to fetch shops for user with ID: {}", userId);
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
     * Create a new shop
     * @param shop The shop to create
     * @param userId The ID of the current user
     * @return The created shop
     */
    @PostMapping
    public ResponseEntity<?> createShop(@RequestBody ShopEntity shop, @RequestParam Long userId) {
        logger.info("POST request to create a new shop from user with ID: {}", userId);
        UserEntity user = userService.getUserById(userId);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Only sellers can create shops"));
        }
        
        ShopEntity createdShop = shopService.createShop(shop, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdShop);
    }

    /**
     * Update an existing shop
     * @param id The shop ID
     * @param shop The updated shop data
     * @param userId The ID of the current user
     * @return The updated shop
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateShop(
            @PathVariable Long id, 
            @RequestBody ShopEntity shop, 
            @RequestParam Long userId) {
        logger.info("PUT request to update shop with ID: {} from user with ID: {}", id, userId);
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
        
        // Update shop properties but keep the owner
        shop.setShopId(id);
        shop.setOwner(existingShop.getOwner());
        shop.setActive(existingShop.isActive());
        if (existingShop.getCreatedAt() != null) {
            shop.setCreatedAt(existingShop.getCreatedAt());
        }
        
        ShopEntity updatedShop = shopService.updateShop(shop);
        return ResponseEntity.ok(updatedShop);
    }

    /**
     * Delete a shop (soft delete)
     * @param id The shop ID
     * @param userId The ID of the current user
     * @return No content response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShop(@PathVariable Long id, @RequestParam Long userId) {
        logger.info("DELETE request for shop with ID: {} from user with ID: {}", id, userId);
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
                .body(Map.of("message", "You can only delete your own shops"));
        }
        
        // Soft delete the shop
        shopService.softDeleteShop(id);
        return ResponseEntity.ok(Map.of("message", "Shop deleted successfully"));
    }
}
