package com.wildeats.onlinecanteen.dto;

import com.wildeats.onlinecanteen.entity.OrderItemEntity;
import java.math.BigDecimal;

/**
 * DTO for Order Item responses
 * Contains only the necessary information about an order item
 */
public class OrderItemResponse {
    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private String menuItemImageURL;
    private Integer quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal subtotal;

    public OrderItemResponse() {
    }

    /**
     * Constructor that converts OrderItemEntity to DTO
     */
    public OrderItemResponse(OrderItemEntity item) {
        this.id = item.getId();
        this.menuItemId = item.getMenuItem().getItemId();
        this.menuItemName = item.getMenuItem().getItemName();
        this.menuItemImageURL = item.getMenuItem().getItemImageURL();
        this.quantity = item.getQuantity();
        this.priceAtPurchase = item.getPriceAtPurchase();
        this.subtotal = item.getSubtotal();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getMenuItemName() {
        return menuItemName;
    }

    public void setMenuItemName(String menuItemName) {
        this.menuItemName = menuItemName;
    }

    public String getMenuItemImageURL() {
        return menuItemImageURL;
    }

    public void setMenuItemImageURL(String menuItemImageURL) {
        this.menuItemImageURL = menuItemImageURL;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceAtPurchase() {
        return priceAtPurchase;
    }

    public void setPriceAtPurchase(BigDecimal priceAtPurchase) {
        this.priceAtPurchase = priceAtPurchase;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}