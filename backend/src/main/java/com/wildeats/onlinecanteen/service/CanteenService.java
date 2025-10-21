package com.wildeats.onlinecanteen.service;

import java.util.List;
import java.util.NoSuchElementException;
import com.wildeats.onlinecanteen.entity.CanteenEntity;
import com.wildeats.onlinecanteen.repository.CanteenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CanteenService {

    @Autowired
    private CanteenRepository crepo;

    public CanteenEntity createOrder(CanteenEntity order) {
        return crepo.save(order);
    }

    public List<CanteenEntity> getAllOrders() {
        return crepo.findAll();
    }

    public List<CanteenEntity> getOrdersByStatus(String status) {
        return crepo.findByStatus(status);
    }

    public CanteenEntity getOrderById(Long id) {
        return crepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Order with ID " + id + " not found"));
    }

    public CanteenEntity updateOrderStatus(Long id, String newStatus) {
        CanteenEntity order = getOrderById(id);
        order.setStatus(newStatus);
        return crepo.save(order);
    }

    public CanteenEntity updateOrder(Long id, CanteenEntity orderDetails) {
        CanteenEntity order = getOrderById(id);
        order.setCustomerName(orderDetails.getCustomerName());
        order.setTotalPrice(orderDetails.getTotalPrice());
        order.setItems(orderDetails.getItems());
        order.setStatus(orderDetails.getStatus());
        return crepo.save(order);
    }

    public void deleteOrder(Long id) {
        if (!crepo.existsById(id)) {
            throw new NoSuchElementException("Order with ID " + id + " not found");
        }
        crepo.deleteById(id);
    }
}