package com.wildeats.onlinecanteen.dto;

import java.util.List;
import com.wildeats.onlinecanteen.entity.OrderItemEntity;

public class CreateOrderRequest {
    private Long shopId;
    private List<OrderItemEntity> orderItems;
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
