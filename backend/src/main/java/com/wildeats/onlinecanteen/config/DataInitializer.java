package com.wildeats.onlinecanteen.config;

import com.wildeats.onlinecanteen.entity.*;
import com.wildeats.onlinecanteen.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Check if data already exists
            if (roleRepository.count() == 0) {
                System.out.println("Initializing roles...");

                // Create roles
                RoleEntity customerRole = new RoleEntity("CUSTOMER");
                RoleEntity sellerRole = new RoleEntity("SELLER");
                RoleEntity adminRole = new RoleEntity("ADMIN");

                roleRepository.save(customerRole);
                roleRepository.save(sellerRole);
                roleRepository.save(adminRole);

                System.out.println("Roles created successfully!");

                // Create sample users
                System.out.println("Creating sample users...");

                // 1. Admin user
                UserEntity admin = new UserEntity();
                admin.setEmail("admin@wildeats.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin = userRepository.save(admin);
                admin.addRole(adminRole);
                userRepository.save(admin);

                // 2. Shop Owner 1
                UserEntity owner1 = new UserEntity();
                owner1.setEmail("shop.coffee@example.com");
                owner1.setPassword(passwordEncoder.encode("password123"));
                owner1.setFirstName("Coffee");
                owner1.setLastName("Owner");
                owner1 = userRepository.save(owner1);
                owner1.addRole(sellerRole);
                owner1.addRole(customerRole); // They can also be customers
                userRepository.save(owner1);

                // 3. Shop Owner 2
                UserEntity owner2 = new UserEntity();
                owner2.setEmail("shop.sandwich@example.com");
                owner2.setPassword(passwordEncoder.encode("password456"));
                owner2.setFirstName("Sandwich");
                owner2.setLastName("Owner");
                owner2 = userRepository.save(owner2);
                owner2.addRole(sellerRole);
                owner2.addRole(customerRole);
                userRepository.save(owner2);

                // 4. Regular customers
                UserEntity customer1 = new UserEntity();
                customer1.setEmail("john.doe@example.com");
                customer1.setPassword(passwordEncoder.encode("password123"));
                customer1.setFirstName("John");
                customer1.setLastName("Doe");
                customer1 = userRepository.save(customer1);
                customer1.addRole(customerRole);
                userRepository.save(customer1);

                UserEntity customer2 = new UserEntity();
                customer2.setEmail("jane.smith@example.com");
                customer2.setPassword(passwordEncoder.encode("password456"));
                customer2.setFirstName("Jane");
                customer2.setLastName("Smith");
                customer2 = userRepository.save(customer2);
                customer2.addRole(customerRole);
                userRepository.save(customer2);

                System.out.println("Users created successfully!");

                // Create sample shops
                System.out.println("Creating sample shops...");

                ShopEntity shop1 = new ShopEntity();
                shop1.setShopName("Coffee Haven");
                shop1.setShopDescr("Specialty coffee and pastries");
                shop1.setStatus(ShopEntity.Status.ACTIVE);
                shop1.setIsOpen(true);
                shop1.setOwner(owner1);
                shopRepository.save(shop1);

                ShopEntity shop2 = new ShopEntity();
                shop2.setShopName("Sandwich Corner");
                shop2.setShopDescr("Fresh sandwiches made to order");
                shop2.setStatus(ShopEntity.Status.ACTIVE);
                shop2.setIsOpen(true);
                shop2.setOwner(owner2);
                shopRepository.save(shop2);

                // Pending shop (waiting for admin approval)
                ShopEntity shop3 = new ShopEntity();
                shop3.setShopName("Dessert Paradise");
                shop3.setShopDescr("Sweet treats and desserts");
                shop3.setStatus(ShopEntity.Status.PENDING);
                shop3.setIsOpen(false);
                shop3.setOwner(owner2);
                shopRepository.save(shop3);

                System.out.println("Shops created successfully!");
                System.out.println("Sample data initialization complete!");
            } else {
                System.out.println("Data already exists, skipping initialization");
            }
        };
    }
}