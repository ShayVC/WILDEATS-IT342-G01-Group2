package com.wildeats.onlinecanteen.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_item")
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private MenuItemEntity menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_at_purchase", nullable = false, precision = 10, scale = 2)
    private Double priceAtPurchase;

    public OrderItemEntity() {
    }

    // Helper method to calculate subtotal
    public Double getSubtotal() {
        if (priceAtPurchase != null && quantity != null) {
            return priceAtPurchase * quantity;
        }
        return 0.0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public MenuItemEntity getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(MenuItemEntity menuItem) {
        this.menuItem = menuItem;
        // Automatically capture the current price
        if (menuItem != null && this.priceAtPurchase == null) {
            this.priceAtPurchase = menuItem.getPrice();
        }
    }

    // Backward compatibility
    public MenuItemEntity getFoodItem() {
        return menuItem;
    }

    public void setFoodItem(MenuItemEntity foodItem) {
        setMenuItem(foodItem);
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPriceAtPurchase() {
        return priceAtPurchase;
    }

    public void setPriceAtPurchase(Double priceAtPurchase) {
        this.priceAtPurchase = priceAtPurchase;
    }

    // Backward compatibility
    public Double getPrice() {
        return priceAtPurchase;
    }

    public void setPrice(Double price) {
        this.priceAtPurchase = price;
    }
}