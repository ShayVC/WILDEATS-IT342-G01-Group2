package com.wildeats.onlinecanteen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.wildeats.onlinecanteen.entity.MenuItemEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.MenuItemService;
import com.wildeats.onlinecanteen.service.ShopService;
import com.wildeats.onlinecanteen.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class MenuItemController {
    private static final Logger logger = LoggerFactory.getLogger(MenuItemController.class);

    @Autowired
    private MenuItemService menuItemService;

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
     * Get all menu items for a specific shop (PUBLIC)
     * 
     * @param shopId The ID of the shop
     * @return List of menu items for the shop
     */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getMenuItemsByShop(@PathVariable Long shopId) {
        logger.info("GET request to fetch menu items for shop with ID: {}", shopId);

        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null || shop.getStatus() != ShopEntity.Status.ACTIVE) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found or inactive"));
        }

        List<MenuItemEntity> menuItems = menuItemService.getAvailableMenuItemsByShopId(shopId);
        return ResponseEntity.ok(menuItems);
    }

    /**
     * Get a menu item by its ID (PUBLIC)
     * 
     * @param id The menu item ID
     * @return The menu item if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItemById(@PathVariable Long id) {
        logger.info("GET request to fetch menu item with ID: {}", id);

        MenuItemEntity menuItem = menuItemService.getMenuItemById(id);
        if (menuItem != null) {
            return ResponseEntity.ok(menuItem);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Menu item not found"));
        }
    }

    /**
     * Search menu items by name in a shop (PUBLIC)
     * 
     * @param shopId     The ID of the shop
     * @param searchTerm The search term
     * @return List of menu items matching the search
     */
    @GetMapping("/shop/{shopId}/search")
    public ResponseEntity<?> searchMenuItems(
            @PathVariable Long shopId,
            @RequestParam String searchTerm) {
        logger.info("Searching menu items in shop {} with term: {}", shopId, searchTerm);

        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null || shop.getStatus() != ShopEntity.Status.ACTIVE) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found or inactive"));
        }

        List<MenuItemEntity> menuItems = menuItemService.searchMenuItems(shopId, searchTerm);
        return ResponseEntity.ok(menuItems);
    }

    /**
     * Get menu items by price range (PUBLIC)
     * 
     * @param shopId   The ID of the shop
     * @param maxPrice The maximum price
     * @return List of menu items within price range
     */
    @GetMapping("/shop/{shopId}/price")
    public ResponseEntity<?> getMenuItemsByPrice(
            @PathVariable Long shopId,
            @RequestParam Double maxPrice) {
        logger.info("Fetching menu items in shop {} with max price: {}", shopId, maxPrice);

        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null || shop.getStatus() != ShopEntity.Status.ACTIVE) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found or inactive"));
        }

        List<MenuItemEntity> menuItems = menuItemService.getMenuItemsByPriceRange(shopId, maxPrice);
        return ResponseEntity.ok(menuItems);
    }

    /**
     * Create a new menu item for a shop (SELLER only)
     * 
     * @param menuItem The menu item to create
     * @param shopId   The ID of the shop
     * @return The created menu item
     */
    @PostMapping
    public ResponseEntity<?> createMenuItem(
            @RequestBody MenuItemEntity menuItem,
            @RequestParam Long shopId) {
        Long userId = getCurrentUserId();
        logger.info("POST request to create menu item for shop {} from user {}", shopId, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        // Check if user exists and is a seller
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only sellers can create menu items"));
        }

        // Check if shop exists and is owned by the user
        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only add menu items to your own shops"));
        }

        try {
            MenuItemEntity createdMenuItem = menuItemService.createMenuItem(menuItem, shopId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMenuItem);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update an existing menu item (SELLER only)
     * 
     * @param id       The menu item ID
     * @param menuItem The updated menu item data
     * @return The updated menu item
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItemEntity menuItem) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to update menu item {} from user {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        // Check if user exists and is a seller
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only sellers can update menu items"));
        }

        // Check if menu item exists
        MenuItemEntity existingItem = menuItemService.getMenuItemById(id);
        if (existingItem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Menu item not found"));
        }

        // Check if the shop is owned by the user
        Long shopId = existingItem.getShop().getShopId();
        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only update menu items in your own shops"));
        }

        menuItem.setItemId(id);

        try {
            MenuItemEntity updatedMenuItem = menuItemService.updateMenuItem(menuItem);
            return ResponseEntity.ok(updatedMenuItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update the availability of a menu item (SELLER only)
     * 
     * @param id          The menu item ID
     * @param isAvailable The new availability status
     * @return The updated menu item
     */
    @PutMapping("/{id}/availability")
    public ResponseEntity<?> updateMenuItemAvailability(
            @PathVariable Long id,
            @RequestParam boolean isAvailable) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to update availability for menu item {} to {} from user {}",
                id, isAvailable, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        // Check if user exists and is a seller
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only sellers can update menu item availability"));
        }

        // Check if menu item exists
        MenuItemEntity existingItem = menuItemService.getMenuItemById(id);
        if (existingItem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Menu item not found"));
        }

        // Check if the shop is owned by the user
        Long shopId = existingItem.getShop().getShopId();
        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only update menu items in your own shops"));
        }

        try {
            MenuItemEntity updatedMenuItem = menuItemService.updateMenuItemAvailability(id, isAvailable);
            return ResponseEntity.ok(updatedMenuItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Delete a menu item (SELLER only)
     * 
     * @param id The ID of the menu item to delete
     * @return Success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("DELETE request for menu item {} from user {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        // Check if user exists and is a seller
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only sellers can delete menu items"));
        }

        // Check if menu item exists
        MenuItemEntity existingItem = menuItemService.getMenuItemById(id);
        if (existingItem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Menu item not found"));
        }

        // Check if the shop is owned by the user
        Long shopId = existingItem.getShop().getShopId();
        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only delete menu items in your own shops"));
        }

        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok(Map.of("message", "Menu item deleted successfully"));
    }

    /**
     * Get count of available menu items for a shop (PUBLIC)
     * 
     * @param shopId The ID of the shop
     * @return Count of available menu items
     */
    @GetMapping("/shop/{shopId}/count")
    public ResponseEntity<?> countAvailableMenuItems(@PathVariable Long shopId) {
        logger.info("Counting available menu items for shop {}", shopId);

        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        long count = menuItemService.countAvailableMenuItems(shopId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}