package com.wildeats.onlinecanteen.dto;

import java.util.List;
import com.wildeats.onlinecanteen.entity.OrderItemEntity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

/**
 * Create Order Request DTO
 * 
 * Architecture Alignment: Layer C (Transactions - "Ledger")
 * - Creates new ORDER record linking Customer to Shop
 * - Validates order items before transaction
 * - Captures PriceAtPurchase snapshot in ORDER_ITEM
 */
public class CreateOrderRequest {

    @NotNull(message = "Shop ID is required")
    private Long shopId;

    @Valid
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemEntity> orderItems;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(Long shopId, List<OrderItemEntity> orderItems, String notes) {
        this.shopId = shopId;
        this.orderItems = orderItems;
        this.notes = notes;
    }

    public Long getShopId() {
        return shopId;
    }

    public void setShopId(Long shopId) {
        this.shopId = shopId;
    }

    public List<OrderItemEntity> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemEntity> orderItems) {
        this.orderItems = orderItems;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}