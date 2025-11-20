package com.wildeats.onlinecanteen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wildeats.onlinecanteen.dto.AuthResponse;
import com.wildeats.onlinecanteen.dto.ChangePasswordRequest;
import com.wildeats.onlinecanteen.dto.UpdateProfileRequest;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get all users (Admin only - for now accessible to all, will be secured with
     * JWT later)
     * 
     * @return List of all users
     */
    @GetMapping("/getAllUsers")
    public List<UserEntity> getAllUsers() {
        logger.info("Fetching all users");
        return userService.getAllUsers();
    }

    /**
     * Get a user by ID
     * 
     * @param id The user ID
     * @return The user if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        logger.info("Fetching user with ID: {}", id);
        UserEntity user = userService.getUserById(id);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Return user without password
        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * Get current user's profile
     * 
     * @param userId The ID of the current user (from request param)
     * @return The user's profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam Long userId) {
        logger.info("Fetching profile for user with ID: {}", userId);

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Return user without password
        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * Update current user's profile (name and email only)
     * 
     * @param userId  The ID of the current user
     * @param request The update request containing new name and email
     * @return The updated user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam Long userId,
            @RequestBody UpdateProfileRequest request) {
        logger.info("Updating profile for user with ID: {}", userId);

        // Validate input
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Name cannot be empty"));
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email cannot be empty"));
        }

        // Basic email validation
        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid email format"));
        }

        try {
            UserEntity updatedUser = userService.updateProfile(userId, request.getName(), request.getEmail());

            if (updatedUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            // Return updated user without password
            AuthResponse response = new AuthResponse();
            response.setId(updatedUser.getId());
            response.setName(updatedUser.getName());
            response.setEmail(updatedUser.getEmail());
            response.setRole(updatedUser.getRole().toString());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Change user's password
     * 
     * @param userId  The ID of the current user
     * @param request The password change request
     * @return Success message
     */
    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(
            @RequestParam Long userId,
            @RequestBody ChangePasswordRequest request) {
        logger.info("Changing password for user with ID: {}", userId);

        // Validate input
        if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is required"));
        }

        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "New password is required"));
        }

        if (request.getNewPassword().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "New password must be at least 6 characters long"));
        }

        try {
            boolean success = userService.changePassword(userId, request.getCurrentPassword(),
                    request.getNewPassword());

            if (!success) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Current password is incorrect"));
            }

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Delete current user's account
     * 
     * @param userId   The ID of the current user
     * @param password The user's password for confirmation
     * @return Success message
     */
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile(
            @RequestParam Long userId,
            @RequestParam String password) {
        logger.info("Deleting account for user with ID: {}", userId);

        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Password is required for account deletion"));
        }

        try {
            boolean success = userService.deleteUserAccount(userId, password);

            if (!success) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Incorrect password"));
            }

            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Create a new user (kept for backward compatibility, use /api/auth/register
     * instead)
     * 
     * @param user The user to create
     * @return The created user
     */
    @PostMapping("/createUser")
    public UserEntity createUser(@RequestBody UserEntity user) {
        logger.info("Creating new user with email: {}", user.getEmail());
        return userService.createUser(user);
    }

    /**
     * Update a user by ID (Admin function - will be secured with JWT later)
     * 
     * @param id   The user ID
     * @param user The updated user data
     * @return The updated user
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserEntity user) {
        logger.info("Admin updating user with ID: {}", id);
        UserEntity updatedUser = userService.updateUser(id, user);

        if (updatedUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Delete a user by ID (Admin function - will be secured with JWT later)
     * 
     * @param id The user ID to delete
     * @return Success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        logger.info("Admin deleting user with ID: {}", id);
        boolean success = userService.deleteUser(id);

        if (!success) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}