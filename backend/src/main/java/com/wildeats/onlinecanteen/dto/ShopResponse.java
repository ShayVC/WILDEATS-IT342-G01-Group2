package com.wildeats.onlinecanteen.dto;

import com.wildeats.onlinecanteen.entity.ShopEntity;
import java.util.Date;

/**
 * DTO for Shop responses
 * Provides shop information without circular references
 */
public class ShopResponse {
    private Long shopId;
    private String shopName;
    private String shopDescr;
    private String shopImageURL;
    private String status;
    private Boolean isOpen;
    private Long ownerId;
    private String ownerName;
    private Date createdAt;
    private Date updatedAt;

    public ShopResponse() {
    }

    /**
     * Constructor that converts ShopEntity to DTO
     */
    public ShopResponse(ShopEntity shop) {
        this.shopId = shop.getShopId();
        this.shopName = shop.getShopName();
        this.shopDescr = shop.getShopDescr();
        this.shopImageURL = shop.getShopImageURL();
        this.status = shop.getStatus().toString();
        this.isOpen = shop.getIsOpen();

        // Owner info (without circular reference)
        if (shop.getOwner() != null) {
            this.ownerId = shop.getOwner().getUserId();
            this.ownerName = shop.getOwner().getName();
        }

        this.createdAt = shop.getCreatedAt();
        this.updatedAt = shop.getUpdatedAt();
    }

    // Getters and Setters
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

    public String getShopDescr() {
        return shopDescr;
    }

    public void setShopDescr(String shopDescr) {
        this.shopDescr = shopDescr;
    }

    public String getShopImageURL() {
        return shopImageURL;
    }

    public void setShopImageURL(String shopImageURL) {
        this.shopImageURL = shopImageURL;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsOpen() {
        return isOpen;
    }

    public void setIsOpen(Boolean isOpen) {
        this.isOpen = isOpen;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}