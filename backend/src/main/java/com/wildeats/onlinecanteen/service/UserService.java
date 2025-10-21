package com.wildeats.onlinecanteen.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepo;

    /**
     * Get all users from the database
     * @return List of all users
     */
    public List<UserEntity> getAllUsers() {
        logger.info("Fetching all users");
        return userRepo.findAll();
    }

    /**
     * Get a user by their ID
     * @param id The user ID
     * @return The user if found, null otherwise
     */
    public UserEntity getUserById(Long id) {
        logger.info("Fetching user with ID: {}", id);
        Optional<UserEntity> user = userRepo.findById(id);
        return user.orElse(null);
    }

    /**
     * Find a user by their email address
     * @param email The email address to search for
     * @return The user if found, null otherwise
     */
    public UserEntity findByEmail(String email) {
        logger.info("Finding user by email: {}", email);
        return userRepo.findByEmail(email);
    }

    /**
     * Create a new user
     * @param user The user entity to create
     * @return The created user with generated ID
     */
    public UserEntity createUser(UserEntity user) {
        logger.info("Creating new user with email: {}", user.getEmail());
        return userRepo.save(user);
    }

    /**
     * Update an existing user
     * @param user The user entity with updated fields
     * @return The updated user
     */
    public UserEntity updateUser(UserEntity user) {
        logger.info("Updating user with ID: {}", user.getId());
        return userRepo.save(user);
    }
    
    /**
     * Update an existing user by ID
     * @param id The ID of the user to update
     * @param updatedUser The user entity with updated fields
     * @return The updated user
     */
    public UserEntity updateUser(Long id, UserEntity updatedUser) {
        logger.info("Updating user with ID: {}", id);
        return userRepo.findById(id).map(user -> {
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            user.setPassword(updatedUser.getPassword());
            if (updatedUser.getRole() != null) {
                user.setRole(updatedUser.getRole());
            }
            return userRepo.save(user);
        }).orElse(null);
    }

    /**
     * Delete a user by their ID
     * @param id The ID of the user to delete
     * @return true if the user was deleted, false if the user was not found
     */
    public boolean deleteUser(Long id) {
        if (userRepo.existsById(id)) {
            userRepo.deleteById(id);
            return true;
        }
        return false;
    }
    
    /**
     * Check if the provided credentials are valid
     * @param email The user's email
     * @param password The user's password
     * @return The authenticated user if credentials are valid, null otherwise
     */
    public UserEntity authenticate(String email, String password) {
        logger.info("Authenticating user with email: {}", email);
        UserEntity user = findByEmail(email);
        
        if (user != null && user.getPassword().equals(password)) {
            // Update last login time
            user.setLastLogin(new java.util.Date());
            updateUser(user);
            return user;
        }
        
        return null;
    }
}

