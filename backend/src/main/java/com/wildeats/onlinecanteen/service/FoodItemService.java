package com.wildeats.onlinecanteen.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wildeats.onlinecanteen.entity.FoodItemEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.repository.FoodItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FoodItemService {
    private static final Logger logger = LoggerFactory.getLogger(FoodItemService.class);

    @Autowired
    private FoodItemRepository foodItemRepo;
    
    @Autowired
    private ShopService shopService;

    /**
     * Get all food items
     * @return List of all food items
     */
    public List<FoodItemEntity> getAllFoodItems() {
        logger.info("Fetching all food items");
        return foodItemRepo.findAll();
    }

    /**
     * Get a food item by its ID
     * @param id The food item ID
     * @return The food item if found, null otherwise
     */
    public FoodItemEntity getFoodItemById(Long id) {
        logger.info("Fetching food item with ID: {}", id);
        Optional<FoodItemEntity> foodItem = foodItemRepo.findById(id);
        return foodItem.orElse(null);
    }
    
    /**
     * Get all food items for a specific shop
     * @param shopId The ID of the shop
     * @return List of food items for the shop
     */
    public List<FoodItemEntity> getFoodItemsByShopId(Long shopId) {
        logger.info("Fetching food items for shop with ID: {}", shopId);
        return foodItemRepo.findByShopShopId(shopId);
    }
    
    /**
     * Get all available food items for a specific shop
     * @param shopId The ID of the shop
     * @return List of available food items for the shop
     */
    public List<FoodItemEntity> getAvailableFoodItemsByShopId(Long shopId) {
        logger.info("Fetching available food items for shop with ID: {}", shopId);
        return foodItemRepo.findByShopShopIdAndIsAvailableTrue(shopId);
    }

    /**
     * Create a new food item for a shop
     * @param foodItem The food item to create
     * @param shopId The ID of the shop
     * @return The created food item
     */
    public FoodItemEntity createFoodItem(FoodItemEntity foodItem, Long shopId) {
        logger.info("Creating new food item for shop with ID: {}", shopId);
        
        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null) {
            logger.error("Shop with ID {} not found", shopId);
            throw new IllegalArgumentException("Shop not found");
        }
        
        foodItem.setShop(shop);
        foodItem.setCreatedAt(new java.util.Date());
        foodItem.setUpdatedAt(new java.util.Date());
        
        return foodItemRepo.save(foodItem);
    }

    /**
     * Update an existing food item
     * @param foodItem The food item with updated fields
     * @return The updated food item
     */
    public FoodItemEntity updateFoodItem(FoodItemEntity foodItem) {
        logger.info("Updating food item with ID: {}", foodItem.getItemId());
        
        FoodItemEntity existingItem = getFoodItemById(foodItem.getItemId());
        if (existingItem == null) {
            logger.error("Food item with ID {} not found", foodItem.getItemId());
            throw new IllegalArgumentException("Food item not found");
        }
        
        // Keep the original shop
        foodItem.setShop(existingItem.getShop());
        
        // Keep the original creation date
        if (existingItem.getCreatedAt() != null) {
            foodItem.setCreatedAt(existingItem.getCreatedAt());
        }
        
        foodItem.updateTimestamp();
        return foodItemRepo.save(foodItem);
    }
    
    /**
     * Update the quantity of a food item
     * @param itemId The ID of the food item
     * @param quantity The new quantity
     * @return The updated food item
     */
    public FoodItemEntity updateFoodItemQuantity(Long itemId, int quantity) {
        logger.info("Updating quantity for food item with ID: {} to {}", itemId, quantity);
        
        FoodItemEntity foodItem = getFoodItemById(itemId);
        if (foodItem == null) {
            logger.error("Food item with ID {} not found", itemId);
            throw new IllegalArgumentException("Food item not found");
        }
        
        foodItem.setQuantity(quantity);
        
        // Update availability based on quantity
        foodItem.setAvailable(quantity > 0);
        
        foodItem.updateTimestamp();
        return foodItemRepo.save(foodItem);
    }
    
    /**
     * Decrease the quantity of a food item
     * @param itemId The ID of the food item
     * @param amount The amount to decrease by
     * @return The updated food item, or null if there's not enough quantity
     */
    public FoodItemEntity decreaseFoodItemQuantity(Long itemId, int amount) {
        logger.info("Decreasing quantity for food item with ID: {} by {}", itemId, amount);
        
        FoodItemEntity foodItem = getFoodItemById(itemId);
        if (foodItem == null) {
            logger.error("Food item with ID {} not found", itemId);
            throw new IllegalArgumentException("Food item not found");
        }
        
        if (foodItem.decreaseQuantity(amount)) {
            return foodItemRepo.save(foodItem);
        } else {
            logger.error("Not enough quantity for food item with ID: {}", itemId);
            return null;
        }
    }

    /**
     * Delete a food item
     * @param id The ID of the food item to delete
     */
    public void deleteFoodItem(Long id) {
        logger.info("Deleting food item with ID: {}", id);
        foodItemRepo.deleteById(id);
    }
    
    /**
     * Check if a food item belongs to a specific shop
     * @param itemId The ID of the food item
     * @param shopId The ID of the shop
     * @return true if the food item belongs to the shop, false otherwise
     */
    public boolean isFoodItemInShop(Long itemId, Long shopId) {
        FoodItemEntity foodItem = getFoodItemById(itemId);
        return foodItem != null && foodItem.getShop() != null && 
               foodItem.getShop().getShopId().equals(shopId);
    }
}
