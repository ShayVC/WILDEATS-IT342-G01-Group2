package com.wildeats.onlinecanteen.dto;

import com.wildeats.onlinecanteen.entity.OrderEntity;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for Order responses
 * Provides a clean, non-circular representation of an order
 */
public class OrderResponse {
    private Long orderId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long shopId;
    private String shopName;
    private String shopImageURL;
    private BigDecimal totalAmount;
    private String status;
    private Integer queueNumber;
    private Date orderDateTime;
    private Date cancelledAt;
    private String cancellationReason;
    private List<OrderItemResponse> orderItems;

    public OrderResponse() {
    }

    /**
     * Constructor that converts OrderEntity to DTO
     */
    public OrderResponse(OrderEntity order) {
        this.orderId = order.getOrderId();

        // Customer info
        if (order.getCustomer() != null) {
            this.customerId = order.getCustomer().getUserId();
            this.customerName = order.getCustomer().getName();
            this.customerEmail = order.getCustomer().getEmail();
        }

        // Shop info
        if (order.getShop() != null) {
            this.shopId = order.getShop().getShopId();
            this.shopName = order.getShop().getShopName();
            this.shopImageURL = order.getShop().getShopImageURL();
        }

        // Order details
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus().toString();
        this.queueNumber = order.getQueueNumber();
        this.orderDateTime = order.getOrderDateTime();
        this.cancelledAt = order.getCancelledAt();
        this.cancellationReason = order.getCancellationReason();

        // Order items
        if (order.getOrderItems() != null) {
            this.orderItems = order.getOrderItems().stream()
                    .map(OrderItemResponse::new)
                    .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
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

    public String getShopImageURL() {
        return shopImageURL;
    }

    public void setShopImageURL(String shopImageURL) {
        this.shopImageURL = shopImageURL;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getQueueNumber() {
        return queueNumber;
    }

    public void setQueueNumber(Integer queueNumber) {
        this.queueNumber = queueNumber;
    }

    public Date getOrderDateTime() {
        return orderDateTime;
    }

    public void setOrderDateTime(Date orderDateTime) {
        this.orderDateTime = orderDateTime;
    }

    public Date getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Date cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public List<OrderItemResponse> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemResponse> orderItems) {
        this.orderItems = orderItems;
    }
}