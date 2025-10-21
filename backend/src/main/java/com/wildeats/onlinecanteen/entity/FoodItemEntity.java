package com.wildeats.onlinecanteen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;

@Entity
@Table(name = "food_items")
public class FoodItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "is_available")
    private boolean isAvailable = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shop_id", nullable = false)
    private ShopEntity shop;
    
    @Column(name = "created_at")
    private java.util.Date createdAt;
    
    @Column(name = "updated_at")
    private java.util.Date updatedAt;

    public FoodItemEntity() {
        this.createdAt = new java.util.Date();
        this.updatedAt = new java.util.Date();
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public ShopEntity getShop() {
        return shop;
    }

    public void setShop(ShopEntity shop) {
        this.shop = shop;
    }

    public java.util.Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.util.Date createdAt) {
        this.createdAt = createdAt;
    }

    public java.util.Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(java.util.Date updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    /**
     * Update the updatedAt timestamp
     */
    public void updateTimestamp() {
        this.updatedAt = new java.util.Date();
    }
    
    /**
     * Decrease the quantity of the food item by the specified amount
     * @param amount The amount to decrease by
     * @return true if the quantity was successfully decreased, false if there's not enough quantity
     */
    public boolean decreaseQuantity(int amount) {
        if (this.quantity >= amount) {
            this.quantity -= amount;
            this.updateTimestamp();
            
            // If quantity becomes 0, set availability to false
            if (this.quantity == 0) {
                this.isAvailable = false;
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Increase the quantity of the food item by the specified amount
     * @param amount The amount to increase by
     */
    public void increaseQuantity(int amount) {
        this.quantity += amount;
        
        // If item was unavailable due to 0 quantity, make it available again
        if (!this.isAvailable && this.quantity > 0) {
            this.isAvailable = true;
        }
        
        this.updateTimestamp();
    }
}
