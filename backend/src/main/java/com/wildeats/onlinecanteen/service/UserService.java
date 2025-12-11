package com.wildeats.onlinecanteen.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.entity.RoleEntity;
import com.wildeats.onlinecanteen.repository.UserRepository;
import com.wildeats.onlinecanteen.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private RoleRepository roleRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all users from the database
     * 
     * @return List of all users
     */
    public List<UserEntity> getAllUsers() {
        logger.info("Fetching all users");
        return userRepo.findAll();
    }

    /**
     * Get a user by their ID
     * 
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
     * 
     * @param email The email address to search for
     * @return The user if found, null otherwise
     */
    public UserEntity findByEmail(String email) {
        logger.info("Finding user by email: {}", email);
        Optional<UserEntity> user = userRepo.findByEmail(email);
        return user.orElse(null);
    }

    /**
     * Check if an email already exists
     * 
     * @param email The email to check
     * @return true if email exists, false otherwise
     */
    public boolean emailExists(String email) {
        return userRepo.existsByEmail(email);
    }

    /**
     * Create a new user with roles
     * 
     * @param user The user entity to create
     * @return The created user with generated ID
     */
    @Transactional
    public UserEntity createUser(UserEntity user) {
        logger.info("Creating new user with email: {}", user.getEmail());

        // Set creation date if not set
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(new Date());
        }

        // If no roles are set, assign default CUSTOMER role
        if (user.getRoles().isEmpty()) {
            Optional<RoleEntity> customerRole = roleRepo.findByRoleName("CUSTOMER");
            if (customerRole.isPresent()) {
                user.addRole(customerRole.get());
            } else {
                logger.warn("CUSTOMER role not found in database");
            }
        }

        return userRepo.save(user);
    }

    /**
     * Add a role to a user
     * 
     * @param userId   The ID of the user
     * @param roleName The name of the role to add
     * @return The updated user
     */
    @Transactional
    public UserEntity addRoleToUser(Long userId, String roleName) {
        logger.info("Adding role {} to user with ID: {}", roleName, userId);

        UserEntity user = getUserById(userId);
        if (user == null) {
            logger.error("User with ID {} not found", userId);
            throw new IllegalArgumentException("User not found");
        }

        Optional<RoleEntity> role = roleRepo.findByRoleName(roleName);
        if (!role.isPresent()) {
            logger.error("Role {} not found", roleName);
            throw new IllegalArgumentException("Role not found");
        }

        user.addRole(role.get());
        return userRepo.save(user);
    }

    /**
     * Remove a role from a user
     * 
     * @param userId   The ID of the user
     * @param roleName The name of the role to remove
     * @return The updated user
     */
    @Transactional
    public UserEntity removeRoleFromUser(Long userId, String roleName) {
        logger.info("Removing role {} from user with ID: {}", roleName, userId);

        UserEntity user = getUserById(userId);
        if (user == null) {
            logger.error("User with ID {} not found", userId);
            throw new IllegalArgumentException("User not found");
        }

        Optional<RoleEntity> role = roleRepo.findByRoleName(roleName);
        if (!role.isPresent()) {
            logger.error("Role {} not found", roleName);
            throw new IllegalArgumentException("Role not found");
        }

        user.removeRole(role.get());
        return userRepo.save(user);
    }

    /**
     * Update an existing user
     * 
     * @param user The user entity with updated fields
     * @return The updated user
     */
    public UserEntity updateUser(UserEntity user) {
        logger.info("Updating user with ID: {}", user.getUserId());
        return userRepo.save(user);
    }

    /**
     * Update an existing user by ID
     * 
     * @param id          The ID of the user to update
     * @param updatedUser The user entity with updated fields
     * @return The updated user
     */
    public UserEntity updateUser(Long id, UserEntity updatedUser) {
        logger.info("Updating user with ID: {}", id);
        return userRepo.findById(id).map(user -> {
            if (updatedUser.getFirstName() != null) {
                user.setFirstName(updatedUser.getFirstName());
            }
            if (updatedUser.getLastName() != null) {
                user.setLastName(updatedUser.getLastName());
            }
            if (updatedUser.getEmail() != null) {
                user.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getPassword() != null) {
                user.setPassword(updatedUser.getPassword());
            }
            if (updatedUser.getAvatarURL() != null) {
                user.setAvatarURL(updatedUser.getAvatarURL());
            }
            return userRepo.save(user);
        }).orElse(null);
    }

    /**
     * Update user profile (name and email only)
     * 
     * @param userId    The ID of the user to update
     * @param firstName The new first name
     * @param lastName  The new last name
     * @param email     The new email
     * @return The updated user
     * @throws IllegalArgumentException if email is already in use by another user
     */
    public UserEntity updateProfile(Long userId, String firstName, String lastName, String email) {
        logger.info("Updating profile for user with ID: {}", userId);

        UserEntity user = getUserById(userId);
        if (user == null) {
            logger.error("User with ID {} not found", userId);
            return null;
        }

        // Check if email is being changed and if it's already in use
        if (!user.getEmail().equals(email)) {
            UserEntity existingUser = findByEmail(email);
            if (existingUser != null && !existingUser.getUserId().equals(userId)) {
                logger.error("Email {} is already in use by another user", email);
                throw new IllegalArgumentException("Email is already in use");
            }
        }

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);

        return userRepo.save(user);
    }

    /**
     * Change user password
     * 
     * @param userId          The ID of the user
     * @param currentPassword The current password for verification
     * @param newPassword     The new password
     * @return true if password was changed successfully, false if current password
     *         is incorrect
     * @throws IllegalArgumentException if user is not found
     */
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        logger.info("Changing password for user with ID: {}", userId);

        UserEntity user = getUserById(userId);
        if (user == null) {
            logger.error("User with ID {} not found", userId);
            throw new IllegalArgumentException("User not found");
        }

        // Verify current password using BCrypt
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            logger.warn("Incorrect current password provided for user with ID: {}", userId);
            return false;
        }

        // Hash and update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        logger.info("Password changed successfully for user with ID: {}", userId);
        return true;
    }

    /**
     * Delete user account with password verification
     * 
     * @param userId   The ID of the user to delete
     * @param password The user's password for confirmation
     * @return true if account was deleted successfully, false if password is
     *         incorrect
     * @throws IllegalArgumentException if user is not found
     */
    public boolean deleteUserAccount(Long userId, String password) {
        logger.info("Attempting to delete account for user with ID: {}", userId);

        UserEntity user = getUserById(userId);
        if (user == null) {
            logger.error("User with ID {} not found", userId);
            throw new IllegalArgumentException("User not found");
        }

        // Verify password using BCrypt
        if (!passwordEncoder.matches(password, user.getPassword())) {
            logger.warn("Incorrect password provided for account deletion, user ID: {}", userId);
            return false;
        }

        // Delete user
        userRepo.deleteById(userId);
        logger.info("Account deleted successfully for user with ID: {}", userId);
        return true;
    }

    /**
     * Delete a user by their ID
     * 
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
     * 
     * @param email    The user's email
     * @param password The user's password
     * @return The authenticated user if credentials are valid, null otherwise
     */
    public UserEntity authenticate(String email, String password) {
        logger.info("Authenticating user with email: {}", email);
        UserEntity user = findByEmail(email);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }

        return null;
    }

    /**
     * Get all customers
     * 
     * @return List of users with CUSTOMER role
     */
    public List<UserEntity> getAllCustomers() {
        logger.info("Fetching all customers");
        return userRepo.findAllCustomers();
    }

    /**
     * Get all sellers
     * 
     * @return List of users with SELLER role
     */
    public List<UserEntity> getAllSellers() {
        logger.info("Fetching all sellers");
        return userRepo.findAllSellers();
    }
}