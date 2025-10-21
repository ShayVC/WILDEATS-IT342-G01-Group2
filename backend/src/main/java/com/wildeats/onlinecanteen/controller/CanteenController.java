package com.wildeats.onlinecanteen.controller;

import com.wildeats.onlinecanteen.entity.CanteenEntity;
import com.wildeats.onlinecanteen.service.CanteenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/canteen")
public class CanteenController {

    @Autowired
    private CanteenService canteenService;

    @GetMapping("/test")
    public String testEndpoint() {
        return "Online Canteen is running!";
    }

    @PostMapping("/orders")
    public CanteenEntity createOrder(@RequestBody CanteenEntity order) {
        return canteenService.createOrder(order);
    }

    @GetMapping
    public List<CanteenEntity> getAllOrders() {
        return canteenService.getAllOrders();
    }

    @GetMapping("/{id}")
    public CanteenEntity getOrderById(@PathVariable Long id) {
        return canteenService.getOrderById(id);
    }

    @GetMapping("/status/{status}")
    public List<CanteenEntity> getOrdersByStatus(@PathVariable String status) {
        return canteenService.getOrdersByStatus(status);
    }

    @PutMapping("/{id}")
    public CanteenEntity updateOrder(@PathVariable Long id, @RequestBody CanteenEntity orderDetails) {
        return canteenService.updateOrder(id, orderDetails);
    }

    @PatchMapping("/{id}/status")
    public CanteenEntity updateOrderStatus(@PathVariable Long id, @RequestBody String newStatus) {
        return canteenService.updateOrderStatus(id, newStatus);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        canteenService.deleteOrder(id);
    }
}