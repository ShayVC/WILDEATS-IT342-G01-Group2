package com.wildeats.onlinecanteen.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class CanteenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userID;
    
    private String customerName;
    private LocalDateTime orderDate;
    private double totalPrice;
    private String status; 
    private String items; 

    public CanteenEntity() {
        this.orderDate = LocalDateTime.now();
        this.status = "PREPARING";
    }

    public CanteenEntity(String customerName, double totalPrice, String items) {
        this();
        this.customerName = customerName;
        this.totalPrice = totalPrice;
        this.items = items;
    }

   
    public Long getuserID() {
        return userID;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }
}

 
