package com.wildeats.onlinecanteen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.wildeats.onlinecanteen.dto.AuthResponse;
import com.wildeats.onlinecanteen.dto.ChangePasswordRequest;
import com.wildeats.onlinecanteen.dto.UpdateProfileRequest;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    /**
     * Helper method to get current user ID from JWT token
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            return (Long) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * Get current user's profile
     * 
     * @return Current user's profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Long userId = getCurrentUserId();
        logger.info("Fetching profile for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Return user without password
        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());

        // Get primary role (first role or highest priority)
        if (!user.getRoles().isEmpty()) {
            // Priority: ADMIN > SELLER > CUSTOMER
            if (user.isAdmin()) {
                response.setRole("ADMIN");
            } else if (user.isSeller()) {
                response.setRole("SELLER");
            } else if (user.isCustomer()) {
                response.setRole("CUSTOMER");
            } else {
                response.setRole(user.getRoles().iterator().next().getRoleName());
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Update current user's profile (first name, last name, and email only)
     * 
     * @param request The update profile request
     * @return Updated user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        Long userId = getCurrentUserId();
        logger.info("Updating profile for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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
            // Split name into first and last name
            String[] nameParts = request.getName().split(" ", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            UserEntity updatedUser = userService.updateProfile(userId, firstName, lastName, request.getEmail());

            if (updatedUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            // Return updated user without password
            AuthResponse response = new AuthResponse();
            response.setId(updatedUser.getUserId());
            response.setName(updatedUser.getName());
            response.setEmail(updatedUser.getEmail());

            if (!updatedUser.getRoles().isEmpty()) {
                if (updatedUser.isAdmin()) {
                    response.setRole("ADMIN");
                } else if (updatedUser.isSeller()) {
                    response.setRole("SELLER");
                } else if (updatedUser.isCustomer()) {
                    response.setRole("CUSTOMER");
                } else {
                    response.setRole(updatedUser.getRoles().iterator().next().getRoleName());
                }
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Change current user's password
     * 
     * @param request The password change request
     * @return Success message
     */
    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Long userId = getCurrentUserId();
        logger.info("Changing password for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

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
     * @param request Map containing password for confirmation
     * @return Success message
     */
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile(@RequestBody Map<String, String> request) {
        Long userId = getCurrentUserId();
        logger.info("Deleting account for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        String password = request.get("password");
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
     * Get a user by ID (PUBLIC - for viewing profiles)
     * Note: Returns limited information, no sensitive data
     * 
     * @param id The user ID
     * @return The user's public profile
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        logger.info("Fetching public profile for user with ID: {}", id);

        UserEntity user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Return only public information
        Map<String, Object> publicProfile = Map.of(
                "id", user.getUserId(),
                "name", user.getName(),
                "avatarURL", user.getAvatarURL() != null ? user.getAvatarURL() : "");

        return ResponseEntity.ok(publicProfile);
    }

    // ============================================
    // ADMIN ENDPOINTS
    // ============================================

    /**
     * Get all users (ADMIN only)
     * 
     * @return List of all users
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        logger.info("Admin fetching all users");

        List<UserEntity> users = userService.getAllUsers();

        // Map to response objects without passwords
        List<AuthResponse> responses = users.stream().map(user -> {
            AuthResponse response = new AuthResponse();
            response.setId(user.getUserId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());

            if (!user.getRoles().isEmpty()) {
                if (user.isAdmin()) {
                    response.setRole("ADMIN");
                } else if (user.isSeller()) {
                    response.setRole("SELLER");
                } else if (user.isCustomer()) {
                    response.setRole("CUSTOMER");
                } else {
                    response.setRole(user.getRoles().iterator().next().getRoleName());
                }
            }

            return response;
        }).toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * Get all customers (ADMIN only)
     * 
     * @return List of all customers
     */
    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCustomers() {
        logger.info("Admin fetching all customers");

        List<UserEntity> customers = userService.getAllCustomers();

        List<AuthResponse> responses = customers.stream().map(user -> {
            AuthResponse response = new AuthResponse();
            response.setId(user.getUserId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole("CUSTOMER");
            return response;
        }).toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * Get all sellers (ADMIN only)
     * 
     * @return List of all sellers
     */
    @GetMapping("/sellers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllSellers() {
        logger.info("Admin fetching all sellers");

        List<UserEntity> sellers = userService.getAllSellers();

        List<AuthResponse> responses = sellers.stream().map(user -> {
            AuthResponse response = new AuthResponse();
            response.setId(user.getUserId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole("SELLER");
            return response;
        }).toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * Update a user by ID (ADMIN only)
     * 
     * @param id            The user ID
     * @param updateRequest The updated user data
     * @return The updated user
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserById(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest updateRequest) {
        logger.info("Admin updating user with ID: {}", id);

        UserEntity user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        try {
            // Split name into first and last name
            String[] nameParts = updateRequest.getName().split(" ", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            UserEntity updatedUser = userService.updateProfile(id, firstName, lastName, updateRequest.getEmail());

            AuthResponse response = new AuthResponse();
            response.setId(updatedUser.getUserId());
            response.setName(updatedUser.getName());
            response.setEmail(updatedUser.getEmail());

            if (!updatedUser.getRoles().isEmpty()) {
                if (updatedUser.isAdmin()) {
                    response.setRole("ADMIN");
                } else if (updatedUser.isSeller()) {
                    response.setRole("SELLER");
                } else if (updatedUser.isCustomer()) {
                    response.setRole("CUSTOMER");
                } else {
                    response.setRole(updatedUser.getRoles().iterator().next().getRoleName());
                }
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Delete a user by ID (ADMIN only)
     * 
     * @param id The user ID to delete
     * @return Success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUserById(@PathVariable Long id) {
        logger.info("Admin deleting user with ID: {}", id);

        // Prevent admin from deleting themselves
        Long currentUserId = getCurrentUserId();
        if (currentUserId != null && currentUserId.equals(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "You cannot delete your own account"));
        }

        boolean success = userService.deleteUser(id);
        if (!success) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /**
     * Add a role to a user (ADMIN only)
     * 
     * @param id      The user ID
     * @param request Map containing the role name
     * @return The updated user
     */
    @PostMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addRoleToUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        logger.info("Admin adding role to user with ID: {}", id);

        String roleName = request.get("roleName");
        if (roleName == null || roleName.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Role name is required"));
        }

        try {
            UserEntity updatedUser = userService.addRoleToUser(id, roleName);

            AuthResponse response = new AuthResponse();
            response.setId(updatedUser.getUserId());
            response.setName(updatedUser.getName());
            response.setEmail(updatedUser.getEmail());

            if (!updatedUser.getRoles().isEmpty()) {
                if (updatedUser.isAdmin()) {
                    response.setRole("ADMIN");
                } else if (updatedUser.isSeller()) {
                    response.setRole("SELLER");
                } else if (updatedUser.isCustomer()) {
                    response.setRole("CUSTOMER");
                } else {
                    response.setRole(updatedUser.getRoles().iterator().next().getRoleName());
                }
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Remove a role from a user (ADMIN only)
     * 
     * @param id       The user ID
     * @param roleName The role name to remove
     * @return The updated user
     */
    @DeleteMapping("/{id}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeRoleFromUser(
            @PathVariable Long id,
            @PathVariable String roleName) {
        logger.info("Admin removing role {} from user with ID: {}", roleName, id);

        try {
            UserEntity updatedUser = userService.removeRoleFromUser(id, roleName);

            AuthResponse response = new AuthResponse();
            response.setId(updatedUser.getUserId());
            response.setName(updatedUser.getName());
            response.setEmail(updatedUser.getEmail());

            if (!updatedUser.getRoles().isEmpty()) {
                if (updatedUser.isAdmin()) {
                    response.setRole("ADMIN");
                } else if (updatedUser.isSeller()) {
                    response.setRole("SELLER");
                } else if (updatedUser.isCustomer()) {
                    response.setRole("CUSTOMER");
                } else {
                    response.setRole(updatedUser.getRoles().iterator().next().getRoleName());
                }
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}