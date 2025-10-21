package com.wildeats.onlinecanteen.config;

import com.wildeats.onlinecanteen.entity.FoodItemEntity;
import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.repository.FoodItemRepository;
import com.wildeats.onlinecanteen.repository.ShopRepository;
import com.wildeats.onlinecanteen.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Date;

@Configuration
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ShopRepository shopRepository;
    
    @Autowired
    private FoodItemRepository foodItemRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Check if data already exists
            if (userRepository.count() == 0 && shopRepository.count() == 0) {
                // Create sample users - Sellers
                UserEntity seller1 = new UserEntity();
                seller1.setName("Coffee Shop Owner");
                seller1.setEmail("shop.coffee@example.com");
                seller1.setPassword("password123");
                seller1.setRole(UserEntity.Role.SELLER);
                seller1.setCreatedAt(new Date());
                seller1.setLastLogin(new Date());
                userRepository.save(seller1);

                UserEntity seller2 = new UserEntity();
                seller2.setName("Sandwich Shop Owner");
                seller2.setEmail("shop.sandwich@example.com");
                seller2.setPassword("password456");
                seller2.setRole(UserEntity.Role.SELLER);
                seller2.setCreatedAt(new Date());
                seller2.setLastLogin(new Date());
                userRepository.save(seller2);
                
                // Create sample users - Customers
                UserEntity customer1 = new UserEntity();
                customer1.setName("John Doe");
                customer1.setEmail("john.doe@example.com");
                customer1.setPassword("password123");
                customer1.setRole(UserEntity.Role.CUSTOMER);
                customer1.setCreatedAt(new Date());
                customer1.setLastLogin(new Date());
                userRepository.save(customer1);

                UserEntity customer2 = new UserEntity();
                customer2.setName("Jane Smith");
                customer2.setEmail("jane.smith@example.com");
                customer2.setPassword("password456");
                customer2.setRole(UserEntity.Role.CUSTOMER);
                customer2.setCreatedAt(new Date());
                customer2.setLastLogin(new Date());
                userRepository.save(customer2);

                // Create sample shops
                ShopEntity shop1 = new ShopEntity();
                shop1.setName("Coffee Haven");
                shop1.setDescription("Specialty coffee and pastries");
                shop1.setLocation("Building A, Floor 1");
                shop1.setPhone("123-456-7890");
                shop1.setEmail("coffee.haven@example.com");
                shop1.setOpeningHours("8:00 AM - 6:00 PM");
                shop1.setOwner(seller1);
                shop1.setCreatedAt(new Date());
                shop1.setUpdatedAt(new Date());
                shop1.setActive(true);
                shopRepository.save(shop1);

                ShopEntity shop2 = new ShopEntity();
                shop2.setName("Sandwich Corner");
                shop2.setDescription("Fresh sandwiches made to order");
                shop2.setLocation("Building B, Floor 2");
                shop2.setPhone("987-654-3210");
                shop2.setEmail("sandwich.corner@example.com");
                shop2.setOpeningHours("10:00 AM - 4:00 PM");
                shop2.setOwner(seller2);
                shop2.setCreatedAt(new Date());
                shop2.setUpdatedAt(new Date());
                shop2.setActive(true);
                shopRepository.save(shop2);
                
                // Create sample food items for Coffee Haven
                FoodItemEntity coffee1 = new FoodItemEntity();
                coffee1.setName("Espresso");
                coffee1.setDescription("Strong coffee brewed by forcing hot water through finely-ground coffee beans");
                coffee1.setPrice(2.50);
                coffee1.setQuantity(100);
                coffee1.setAvailable(true);
                coffee1.setShop(shop1);
                coffee1.setCreatedAt(new Date());
                coffee1.setUpdatedAt(new Date());
                foodItemRepository.save(coffee1);
                
                FoodItemEntity coffee2 = new FoodItemEntity();
                coffee2.setName("Cappuccino");
                coffee2.setDescription("Espresso with steamed milk and foam");
                coffee2.setPrice(3.50);
                coffee2.setQuantity(80);
                coffee2.setAvailable(true);
                coffee2.setShop(shop1);
                coffee2.setCreatedAt(new Date());
                coffee2.setUpdatedAt(new Date());
                foodItemRepository.save(coffee2);
                
                FoodItemEntity pastry1 = new FoodItemEntity();
                pastry1.setName("Croissant");
                pastry1.setDescription("Buttery, flaky pastry");
                pastry1.setPrice(2.00);
                pastry1.setQuantity(50);
                pastry1.setAvailable(true);
                pastry1.setShop(shop1);
                pastry1.setCreatedAt(new Date());
                pastry1.setUpdatedAt(new Date());
                foodItemRepository.save(pastry1);
                
                // Create sample food items for Sandwich Corner
                FoodItemEntity sandwich1 = new FoodItemEntity();
                sandwich1.setName("Turkey Club");
                sandwich1.setDescription("Turkey, bacon, lettuce, tomato, and mayo on toasted bread");
                sandwich1.setPrice(6.50);
                sandwich1.setQuantity(30);
                sandwich1.setAvailable(true);
                sandwich1.setShop(shop2);
                sandwich1.setCreatedAt(new Date());
                sandwich1.setUpdatedAt(new Date());
                foodItemRepository.save(sandwich1);
                
                FoodItemEntity sandwich2 = new FoodItemEntity();
                sandwich2.setName("Veggie Delight");
                sandwich2.setDescription("Cucumber, avocado, lettuce, tomato, and hummus on whole grain bread");
                sandwich2.setPrice(5.50);
                sandwich2.setQuantity(25);
                sandwich2.setAvailable(true);
                sandwich2.setShop(shop2);
                sandwich2.setCreatedAt(new Date());
                sandwich2.setUpdatedAt(new Date());
                foodItemRepository.save(sandwich2);
                
                FoodItemEntity side1 = new FoodItemEntity();
                side1.setName("Potato Chips");
                side1.setDescription("Crispy, salted potato chips");
                side1.setPrice(1.50);
                side1.setQuantity(100);
                side1.setAvailable(true);
                side1.setShop(shop2);
                side1.setCreatedAt(new Date());
                side1.setUpdatedAt(new Date());
                foodItemRepository.save(side1);

                System.out.println("Sample data initialized successfully!");
            } else {
                System.out.println("Data already exists, skipping initialization");
            }
        };
    }
}
