package com.wildeats.onlinecanteen.dto;

import com.wildeats.onlinecanteen.entity.MenuItemEntity;
import java.math.BigDecimal;

/**
 * DTO for Menu Item responses
 * Provides menu item information without circular references
 */
public class MenuItemResponse {
    private Long itemId;
    private Long shopId;
    private String shopName;
    private String itemName;
    private String itemDescr;
    private String itemImageURL;
    private BigDecimal price;
    private Boolean isAvailable;

    public MenuItemResponse() {
    }

    /**
     * Constructor that converts MenuItemEntity to DTO
     */
    public MenuItemResponse(MenuItemEntity menuItem) {
        this.itemId = menuItem.getItemId();

        // Shop info (without circular reference)
        if (menuItem.getShop() != null) {
            this.shopId = menuItem.getShop().getShopId();
            this.shopName = menuItem.getShop().getShopName();
        }

        this.itemName = menuItem.getItemName();
        this.itemDescr = menuItem.getItemDescr();
        this.itemImageURL = menuItem.getItemImageURL();
        this.price = menuItem.getPrice();
        this.isAvailable = menuItem.getIsAvailable();
    }

    // Getters and Setters
    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getShopId() {
        return shopId;
    }

    public void setShopId(Long shopId) {
        this.shopId = shopId;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemDescr() {
        return itemDescr;
    }

    public void setItemDescr(String itemDescr) {
        this.itemDescr = itemDescr;
    }

    public String getItemImageURL() {
        return itemImageURL;
    }

    public void setItemImageURL(String itemImageURL) {
        this.itemImageURL = itemImageURL;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
}