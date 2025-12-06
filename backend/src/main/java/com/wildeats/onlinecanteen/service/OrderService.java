package com.wildeats.onlinecanteen.service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wildeats.onlinecanteen.entity.OrderEntity;
import com.wildeats.onlinecanteen.entity.OrderItemEntity;
import com.wildeats.onlinecanteen.entity.MenuItemEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.repository.OrderRepository;
import com.wildeats.onlinecanteen.repository.OrderItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    @Autowired
    private MenuItemService menuItemService;

    @Autowired
    private ShopService shopService;

    @Autowired
    private UserService userService;

    /**
     * Get all orders
     * 
     * @return List of all orders
     */
    public List<OrderEntity> getAllOrders() {
        logger.info("Fetching all orders");
        return orderRepo.findAll();
    }

    /**
     * Get an order by its ID
     * 
     * @param id The order ID
     * @return The order if found, null otherwise
     */
    public OrderEntity getOrderById(Long id) {
        logger.info("Fetching order with ID: {}", id);
        Optional<OrderEntity> order = orderRepo.findById(id);
        return order.orElse(null);
    }

    /**
     * Get all orders for a specific customer
     * 
     * @param customerId The ID of the customer
     * @return List of orders for the customer
     */
    public List<OrderEntity> getOrdersByCustomerId(Long customerId) {
        logger.info("Fetching orders for customer with ID: {}", customerId);
        return orderRepo.findByCustomerUserIdOrderByOrderDateTimeDesc(customerId);
    }

    /**
     * Get all orders for a specific shop
     * 
     * @param shopId The ID of the shop
     * @return List of orders for the shop
     */
    public List<OrderEntity> getOrdersByShopId(Long shopId) {
        logger.info("Fetching orders for shop with ID: {}", shopId);
        return orderRepo.findByShopShopIdOrderByOrderDateTimeDesc(shopId);
    }

    /**
     * Get all orders for a specific shop with a specific status
     * 
     * @param shopId The ID of the shop
     * @param status The status of the orders
     * @return List of orders for the shop with the specified status
     */
    public List<OrderEntity> getOrdersByShopIdAndStatus(Long shopId, OrderEntity.Status status) {
        logger.info("Fetching orders for shop with ID: {} and status: {}", shopId, status);
        return orderRepo.findByShopShopIdAndStatusOrderByOrderDateTimeDesc(shopId, status);
    }

    /**
     * Get all orders for a specific customer with a specific status
     * 
     * @param customerId The ID of the customer
     * @param status     The status of the orders
     * @return List of orders for the customer with the specified status
     */
    public List<OrderEntity> getOrdersByCustomerIdAndStatus(Long customerId, OrderEntity.Status status) {
        logger.info("Fetching orders for customer with ID: {} and status: {}", customerId, status);
        return orderRepo.findByCustomerUserIdAndStatusOrderByOrderDateTimeDesc(customerId, status);
    }

    /**
     * Get all active orders for a shop
     * 
     * @param shopId The ID of the shop
     * @return List of active orders
     */
    public List<OrderEntity> getActiveOrdersByShopId(Long shopId) {
        logger.info("Fetching active orders for shop with ID: {}", shopId);
        return orderRepo.findActiveOrdersByShopId(shopId);
    }

    /**
     * Generate the next queue number for a shop
     * 
     * @param shopId The ID of the shop
     * @return The next queue number
     */
    private Integer generateQueueNumber(Long shopId) {
        // Get start and end of today
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startOfDay = cal.getTime();

        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        cal.set(Calendar.MILLISECOND, 999);
        Date endOfDay = cal.getTime();

        // Get max queue number for today
        Integer maxQueueNumber = orderRepo.findMaxQueueNumberForShopAndDate(shopId, startOfDay, endOfDay);

        // If no orders today, start from 1
        return (maxQueueNumber == null) ? 1 : maxQueueNumber + 1;
    }

    /**
     * Create a new order
     * 
     * @param customerId The ID of the customer placing the order
     * @param shopId     The ID of the shop the order is being placed at
     * @param orderItems List of order items
     * @param notes      Any notes for the order
     * @return The created order
     */
    @Transactional
    public OrderEntity createOrder(Long customerId, Long shopId, List<OrderItemEntity> orderItems, String notes) {
        logger.info("Creating new order for customer with ID: {} at shop with ID: {}", customerId, shopId);

        UserEntity customer = userService.getUserById(customerId);
        if (customer == null) {
            logger.error("Customer with ID {} not found", customerId);
            throw new IllegalArgumentException("Customer not found");
        }

        ShopEntity shop = shopService.getShopById(shopId);
        if (shop == null) {
            logger.error("Shop with ID {} not found", shopId);
            throw new IllegalArgumentException("Shop not found");
        }

        // Check if shop is operational
        if (!shop.isOperational()) {
            logger.error("Shop with ID {} is not operational", shopId);
            throw new IllegalStateException("Shop is not currently accepting orders");
        }

        // Create the order
        OrderEntity order = new OrderEntity();
        order.setCustomer(customer);
        order.setShop(shop);
        order.setStatus(OrderEntity.Status.PENDING);
        order.setOrderDateTime(new Date());
        order.setQueueNumber(generateQueueNumber(shopId));

        // Add order items
        for (OrderItemEntity item : orderItems) {
            MenuItemEntity menuItem = menuItemService.getMenuItemById(item.getMenuItem().getItemId());
            if (menuItem == null) {
                logger.error("Menu item with ID {} not found", item.getMenuItem().getItemId());
                throw new IllegalArgumentException("Menu item not found");
            }

            // Check if menu item belongs to the shop
            if (!menuItemService.isMenuItemInShop(menuItem.getItemId(), shopId)) {
                logger.error("Menu item with ID {} does not belong to shop with ID {}",
                        menuItem.getItemId(), shopId);
                throw new IllegalArgumentException("Menu item does not belong to the shop");
            }

            // Check if menu item is available
            if (!menuItem.getIsAvailable()) {
                logger.error("Menu item with ID {} is not available", menuItem.getItemId());
                throw new IllegalArgumentException(menuItem.getItemName() + " is currently not available");
            }

            // Set the menu item and capture current price
            item.setMenuItem(menuItem);
            item.setPriceAtPurchase(menuItem.getPrice());

            // Add to order
            order.addOrderItem(item);
        }

        // Calculate total amount
        order.calculateTotalAmount();

        // Save the order
        OrderEntity savedOrder = orderRepo.save(order);

        logger.info("Order created with ID: {} and queue number: {}", savedOrder.getOrderId(),
                savedOrder.getQueueNumber());
        return savedOrder;
    }

    /**
     * Update the status of an order
     * 
     * @param orderId The ID of the order
     * @param status  The new status
     * @return The updated order
     */
    @Transactional
    public OrderEntity updateOrderStatus(Long orderId, OrderEntity.Status status) {
        logger.info("Updating status for order with ID: {} to {}", orderId, status);

        OrderEntity order = getOrderById(orderId);
        if (order == null) {
            logger.error("Order with ID {} not found", orderId);
            throw new IllegalArgumentException("Order not found");
        }

        order.setStatus(status);

        return orderRepo.save(order);
    }

    /**
     * Cancel an order with a reason
     * 
     * @param orderId The ID of the order to cancel
     * @param reason  The reason for cancellation
     * @return The cancelled order
     */
    @Transactional
    public OrderEntity cancelOrder(Long orderId, String reason) {
        logger.info("Cancelling order with ID: {} with reason: {}", orderId, reason);

        OrderEntity order = getOrderById(orderId);
        if (order == null) {
            logger.error("Order with ID {} not found", orderId);
            throw new IllegalArgumentException("Order not found");
        }

        // Can only cancel orders that are PENDING or PREPARING
        if (order.getStatus() == OrderEntity.Status.COMPLETED ||
                order.getStatus() == OrderEntity.Status.CANCELLED) {
            logger.error("Cannot cancel order with status: {}", order.getStatus());
            throw new IllegalStateException("Cannot cancel order with current status");
        }

        order.cancel(reason);
        return orderRepo.save(order);
    }

    /**
     * Check if an order belongs to a specific customer
     * 
     * @param orderId    The ID of the order
     * @param customerId The ID of the customer
     * @return true if the order belongs to the customer, false otherwise
     */
    public boolean isOrderOwnedByCustomer(Long orderId, Long customerId) {
        OrderEntity order = getOrderById(orderId);
        return order != null && order.getCustomer() != null &&
                order.getCustomer().getUserId().equals(customerId);
    }

    /**
     * Check if an order is from a specific shop
     * 
     * @param orderId The ID of the order
     * @param shopId  The ID of the shop
     * @return true if the order is from the shop, false otherwise
     */
    public boolean isOrderFromShop(Long orderId, Long shopId) {
        OrderEntity order = getOrderById(orderId);
        return order != null && order.getShop() != null &&
                order.getShop().getShopId().equals(shopId);
    }

    /**
     * Get orders for a shop within a date range
     * 
     * @param shopId    The ID of the shop
     * @param startDate The start date
     * @param endDate   The end date
     * @return List of orders within the date range
     */
    public List<OrderEntity> getOrdersByShopAndDateRange(Long shopId, Date startDate, Date endDate) {
        logger.info("Fetching orders for shop {} between {} and {}", shopId, startDate, endDate);
        return orderRepo.findByShopIdAndDateRange(shopId, startDate, endDate);
    }

    /**
     * Calculate revenue for a shop within a date range
     * 
     * @param shopId    The ID of the shop
     * @param startDate The start date
     * @param endDate   The end date
     * @return Total revenue
     */
    public Double calculateRevenue(Long shopId, Date startDate, Date endDate) {
        logger.info("Calculating revenue for shop {} between {} and {}", shopId, startDate, endDate);
        return orderRepo.calculateRevenueForShopAndDateRange(shopId, startDate, endDate);
    }
}