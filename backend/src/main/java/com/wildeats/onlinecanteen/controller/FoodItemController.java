package com.wildeats.onlinecanteen.controller;

import java.util.List;
import java.util.Map;

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

import com.wildeats.onlinecanteen.entity.FoodItemEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.FoodItemService;
import com.wildeats.onlinecanteen.service.ShopService;
import com.wildeats.onlinecanteen.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/food")
public class FoodItemController {
    private static final Logger logger = LoggerFactory.getLogger(FoodItemController.class);

    @Autowired
    private FoodItemService foodItemService;
    
    @Autowired
    private ShopService shopService;
    
    @Autowired
    private UserService userService;

    /**
     * Get all food items for a specific shop
     * @param shopId The ID of the shop
     * @return List of food items for the shop
     */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getFoodItemsByShop(@PathVariable Long shopId) {
        logger.info("GET request to fetch food items for shop with ID: {}", shopId);
        
        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null || !shop.isActive()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Shop not found or inactive"));
        }
        
        List<FoodItemEntity> foodItems = foodItemService.getAvailableFoodItemsByShopId(shopId);
        return ResponseEntity.ok(foodItems);
    }

    /**
     * Get a food item by its ID
     * @param id The food item ID
     * @return The food item if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFoodItemById(@PathVariable Long id) {
        logger.info("GET request to fetch food item with ID: {}", id);
        
        FoodItemEntity foodItem = foodItemService.getFoodItemById(id);
        if (foodItem != null) {
            return ResponseEntity.ok(foodItem);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Food item not found"));
        }
    }

    /**
     * Create a new food item for a shop
     * @param foodItem The food item to create
     * @param shopId The ID of the shop
     * @param userId The ID of the current user
     * @return The created food item
     */
    @PostMapping
    public ResponseEntity<?> createFoodItem(
            @RequestBody FoodItemEntity foodItem,
            @RequestParam Long shopId,
            @RequestParam Long userId) {
        logger.info("POST request to create a new food item for shop with ID: {} from user with ID: {}", shopId, userId);
        
        // Check if user exists and is a seller
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Only sellers can create food items"));
        }
        
        // Check if shop exists and is owned by the user
        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Shop not found"));
        }
        
        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only add food items to your own shops"));
        }
        
        try {
            FoodItemEntity createdFoodItem = foodItemService.createFoodItem(foodItem, shopId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFoodItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update an existing food item
     * @param id The food item ID
     * @param foodItem The updated food item data
     * @param userId The ID of the current user
     * @return The updated food item
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItemEntity foodItem,
            @RequestParam Long userId) {
        logger.info("PUT request to update food item with ID: {} from user with ID: {}", id, userId);
        
        // Check if user exists and is a seller
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Only sellers can update food items"));
        }
        
        // Check if food item exists
        FoodItemEntity existingItem = foodItemService.getFoodItemById(id);
        if (existingItem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Food item not found"));
        }
        
        // Check if the shop is owned by the user
        Long shopId = existingItem.getShop().getShopId();
        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only update food items in your own shops"));
        }
        
        foodItem.setItemId(id);
        
        try {
            FoodItemEntity updatedFoodItem = foodItemService.updateFoodItem(foodItem);
            return ResponseEntity.ok(updatedFoodItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update the quantity of a food item
     * @param id The food item ID
     * @param quantity The new quantity
     * @param userId The ID of the current user
     * @return The updated food item
     */
    @PutMapping("/{id}/quantity")
    public ResponseEntity<?> updateFoodItemQuantity(
            @PathVariable Long id,
            @RequestParam int quantity,
            @RequestParam Long userId) {
        logger.info("PUT request to update quantity for food item with ID: {} to {} from user with ID: {}", 
                id, quantity, userId);
        
        // Check if user exists and is a seller
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Only sellers can update food item quantities"));
        }
        
        // Check if food item exists
        FoodItemEntity existingItem = foodItemService.getFoodItemById(id);
        if (existingItem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Food item not found"));
        }
        
        // Check if the shop is owned by the user
        Long shopId = existingItem.getShop().getShopId();
        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only update food items in your own shops"));
        }
        
        try {
            FoodItemEntity updatedFoodItem = foodItemService.updateFoodItemQuantity(id, quantity);
            return ResponseEntity.ok(updatedFoodItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Delete a food item
     * @param id The ID of the food item to delete
     * @param userId The ID of the current user
     * @return Success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFoodItem(
            @PathVariable Long id,
            @RequestParam Long userId) {
        logger.info("DELETE request for food item with ID: {} from user with ID: {}", id, userId);
        
        // Check if user exists and is a seller
        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }
        
        if (!user.isSeller()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Only sellers can delete food items"));
        }
        
        // Check if food item exists
        FoodItemEntity existingItem = foodItemService.getFoodItemById(id);
        if (existingItem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Food item not found"));
        }
        
        // Check if the shop is owned by the user
        Long shopId = existingItem.getShop().getShopId();
        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only delete food items in your own shops"));
        }
        
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.ok(Map.of("message", "Food item deleted successfully"));
    }
}
