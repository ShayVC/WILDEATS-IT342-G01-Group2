package com.wildeats.onlinecanteen.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wildeats.onlinecanteen.dto.MenuItemOptionsDTO;
import com.wildeats.onlinecanteen.entity.MenuItemAddonEntity;
import com.wildeats.onlinecanteen.entity.MenuItemEntity;
import com.wildeats.onlinecanteen.entity.MenuItemFlavorEntity;
import com.wildeats.onlinecanteen.entity.MenuItemVariantEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.repository.MenuItemAddonRepository;
import com.wildeats.onlinecanteen.repository.MenuItemFlavorRepository;
import com.wildeats.onlinecanteen.repository.MenuItemRepository;
import com.wildeats.onlinecanteen.repository.MenuItemVariantRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MenuItemService {
    private static final Logger logger = LoggerFactory.getLogger(MenuItemService.class);

    @Autowired
    private MenuItemRepository menuItemRepo;

    @Autowired
    private MenuItemVariantRepository variantRepo;

    @Autowired
    private MenuItemAddonRepository addonRepo;

    @Autowired
    private MenuItemFlavorRepository flavorRepo;

    @Autowired
    private ShopService shopService;

    /**
     * Get all menu items
     * 
     * @return List of all menu items
     */
    public List<MenuItemEntity> getAllMenuItems() {
        logger.info("Fetching all menu items");
        return menuItemRepo.findAll();
    }

    /**
     * Get a menu item by its ID
     * 
     * @param id The menu item ID
     * @return The menu item if found, null otherwise
     */
    public MenuItemEntity getMenuItemById(Long id) {
        logger.info("Fetching menu item with ID: {}", id);
        Optional<MenuItemEntity> menuItem = menuItemRepo.findById(id);
        return menuItem.orElse(null);
    }

    /**
     * Get all menu items for a specific shop
     * 
     * @param shopId The ID of the shop
     * @return List of menu items for the shop
     */
    public List<MenuItemEntity> getMenuItemsByShopId(Long shopId) {
        logger.info("Fetching menu items for shop with ID: {}", shopId);
        return menuItemRepo.findByShopShopId(shopId);
    }

    /**
     * Get all available menu items for a specific shop
     * 
     * @param shopId The ID of the shop
     * @return List of available menu items for the shop
     */
    public List<MenuItemEntity> getAvailableMenuItemsByShopId(Long shopId) {
        logger.info("Fetching available menu items for shop with ID: {}", shopId);
        return menuItemRepo.findByShopShopIdAndIsAvailable(shopId, true);
    }

    /**
     * Search menu items by name in a specific shop
     * 
     * @param shopId     The ID of the shop
     * @param searchTerm The search term
     * @return List of menu items matching the search term
     */
    public List<MenuItemEntity> searchMenuItems(Long shopId, String searchTerm) {
        logger.info("Searching menu items in shop {} with term: {}", shopId, searchTerm);
        return menuItemRepo.searchByItemName(shopId, searchTerm);
    }

    /**
     * Get menu items by price range
     * 
     * @param shopId   The ID of the shop
     * @param maxPrice The maximum price
     * @return List of menu items within the price range
     */
    public List<MenuItemEntity> getMenuItemsByPriceRange(Long shopId, Double maxPrice) {
        logger.info("Fetching menu items in shop {} with price <= {}", shopId, maxPrice);
        return menuItemRepo.findByShopIdAndPriceLessThanEqual(shopId, maxPrice);
    }

    public MenuItemOptionsDTO getMenuItemOptions(Long itemId) {
        List<MenuItemVariantEntity> variants = variantRepo.findByMenuItemItemId(itemId);
        List<MenuItemAddonEntity> addons = addonRepo.findByMenuItemItemId(itemId);
        List<MenuItemFlavorEntity> flavors = flavorRepo.findByMenuItemItemId(itemId);

        return new MenuItemOptionsDTO(variants, addons, flavors);
    }

    /**
     * Create a new menu item for a shop
     * 
     * @param menuItem The menu item to create
     * @param shopId   The ID of the shop
     * @return The created menu item
     */
    public MenuItemEntity createMenuItem(MenuItemEntity menuItem, Long shopId) {
        logger.info("Creating new menu item for shop with ID: {}", shopId);

        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null) {
            logger.error("Shop with ID {} not found", shopId);
            throw new IllegalArgumentException("Shop not found");
        }

        // Only allow creating items for ACTIVE shops
        if (shop.getStatus() != ShopEntity.Status.ACTIVE) {
            logger.error("Cannot add items to shop with status: {}", shop.getStatus());
            throw new IllegalStateException("Can only add items to active shops");
        }

        menuItem.setShop(shop);

        return menuItemRepo.save(menuItem);
    }

    /**
     * Update an existing menu item
     * 
     * @param menuItem The menu item with updated fields
     * @return The updated menu item
     */
    public MenuItemEntity updateMenuItem(MenuItemEntity menuItem) {
        logger.info("Updating menu item with ID: {}", menuItem.getItemId());

        MenuItemEntity existingItem = getMenuItemById(menuItem.getItemId());
        if (existingItem == null) {
            logger.error("Menu item with ID {} not found", menuItem.getItemId());
            throw new IllegalArgumentException("Menu item not found");
        }

        // Keep the original shop
        menuItem.setShop(existingItem.getShop());

        return menuItemRepo.save(menuItem);
    }

    /**
     * Update the availability of a menu item
     * 
     * @param itemId      The ID of the menu item
     * @param isAvailable The new availability status
     * @return The updated menu item
     */
    public MenuItemEntity updateMenuItemAvailability(Long itemId, boolean isAvailable) {
        logger.info("Updating availability for menu item with ID: {} to {}", itemId, isAvailable);

        MenuItemEntity menuItem = getMenuItemById(itemId);
        if (menuItem == null) {
            logger.error("Menu item with ID {} not found", itemId);
            throw new IllegalArgumentException("Menu item not found");
        }

        menuItem.setIsAvailable(isAvailable);
        return menuItemRepo.save(menuItem);
    }

    /**
     * Delete a menu item
     * 
     * @param id The ID of the menu item to delete
     */
    public void deleteMenuItem(Long id) {
        logger.info("Deleting menu item with ID: {}", id);
        menuItemRepo.deleteById(id);
    }

    /**
     * Check if a menu item belongs to a specific shop
     * 
     * @param itemId The ID of the menu item
     * @param shopId The ID of the shop
     * @return true if the menu item belongs to the shop, false otherwise
     */
    public boolean isMenuItemInShop(Long itemId, Long shopId) {
        MenuItemEntity menuItem = getMenuItemById(itemId);
        return menuItem != null && menuItem.getShop() != null &&
                menuItem.getShop().getShopId().equals(shopId);
    }

    /**
     * Count available menu items for a shop
     * 
     * @param shopId The ID of the shop
     * @return Count of available menu items
     */
    public long countAvailableMenuItems(Long shopId) {
        logger.info("Counting available menu items for shop with ID: {}", shopId);
        return menuItemRepo.countAvailableByShopId(shopId);
    }
}