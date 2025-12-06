package com.wildeats.onlinecanteen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.entity.RoleEntity;
import com.wildeats.onlinecanteen.security.JwtUtil;
import com.wildeats.onlinecanteen.service.UserService;
import com.wildeats.onlinecanteen.repository.RoleRepository;
import com.wildeats.onlinecanteen.dto.LoginRequest;
import com.wildeats.onlinecanteen.dto.RegisterRequest;
import com.wildeats.onlinecanteen.dto.AuthResponse;

import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * User login
     * 
     * @param loginRequest Email and password
     * @return JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());

        try {
            // Validate input
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email is required"));
            }

            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Password is required"));
            }

            UserEntity user = userService.findByEmail(loginRequest.getEmail());

            if (user == null) {
                logger.warn("Login failed - user not found: {}", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }

            // Check password using BCrypt
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                logger.warn("Login failed - incorrect password for: {}", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }

            // Determine primary role
            String primaryRole = "CUSTOMER"; // Default role
            if (user.isAdmin()) {
                primaryRole = "ADMIN";
            } else if (user.isSeller()) {
                primaryRole = "SELLER";
            } else if (user.isCustomer()) {
                primaryRole = "CUSTOMER";
            } else if (!user.getRoles().isEmpty()) {
                primaryRole = user.getRoles().iterator().next().getRoleName();
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), primaryRole);

            // Create response with user details and token
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", new AuthResponse(
                    user.getUserId(),
                    user.getName(),
                    user.getEmail(),
                    primaryRole));

            logger.info("Login successful for: {}", loginRequest.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login error for {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * User registration
     * 
     * @param registerRequest Name, email, and password
     * @return JWT token and user details
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        logger.info("Registration attempt for email: {}", registerRequest.getEmail());

        try {
            // Validate input
            if (registerRequest.getName() == null || registerRequest.getName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Name is required"));
            }

            if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email is required"));
            }

            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Password is required"));
            }

            // Email format validation
            if (!registerRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid email format"));
            }

            // Check if email already exists
            if (userService.findByEmail(registerRequest.getEmail()) != null) {
                logger.warn("Registration failed - email already exists: {}", registerRequest.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email already in use"));
            }

            // Validate password strength
            if (registerRequest.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Password must be at least 6 characters long"));
            }

            // Split name into first and last name
            String[] nameParts = registerRequest.getName().split(" ", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            // Create new user
            UserEntity newUser = new UserEntity();
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setEmail(registerRequest.getEmail());
            newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            newUser.setCreatedAt(new Date());

            // Determine role based on email prefix
            // Emails starting with "shop." get SELLER role, others get CUSTOMER role
            String primaryRole;
            if (registerRequest.getEmail().startsWith("shop.")) {
                primaryRole = "SELLER";

                // Add both SELLER and CUSTOMER roles (sellers can also be customers)
                Optional<RoleEntity> sellerRole = roleRepository.findByRoleName("SELLER");
                Optional<RoleEntity> customerRole = roleRepository.findByRoleName("CUSTOMER");

                if (sellerRole.isPresent()) {
                    newUser.addRole(sellerRole.get());
                }
                if (customerRole.isPresent()) {
                    newUser.addRole(customerRole.get());
                }
            } else {
                primaryRole = "CUSTOMER";

                // Add CUSTOMER role
                Optional<RoleEntity> customerRole = roleRepository.findByRoleName("CUSTOMER");
                if (customerRole.isPresent()) {
                    newUser.addRole(customerRole.get());
                }
            }

            // Save user to database
            UserEntity savedUser = userService.createUser(newUser);
            logger.info("User registered successfully with ID: {} and role: {}", savedUser.getUserId(), primaryRole);

            // Generate JWT token
            String token = jwtUtil.generateToken(
                    savedUser.getUserId(),
                    savedUser.getEmail(),
                    primaryRole);

            // Create response with user details and token
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", new AuthResponse(
                    savedUser.getUserId(),
                    savedUser.getName(),
                    savedUser.getEmail(),
                    primaryRole));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Registration error for {}: {}", registerRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Check authentication status
     * 
     * @return Success message if authenticated
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkAuthStatus() {
        // This endpoint validates the JWT token via the filter
        logger.info("Auth check - token is valid");
        return ResponseEntity.ok(Map.of("message", "Authenticated", "authenticated", true));
    }

    /**
     * User logout
     * Note: With JWT, logout is handled client-side by removing the token
     * 
     * @return Success message
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // With JWT, logout is handled client-side by removing the token
        // Server-side logout would require token blacklisting (advanced feature)
        logger.info("Logout request received");
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * Verify token (useful for mobile apps)
     * 
     * @param request Map containing the token
     * @return User details if token is valid
     */
    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Token is required"));
        }

        try {
            // Validate token
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token"));
            }

            // Extract user details from token
            Long userId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);

            // Verify user still exists
            UserEntity user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }

            // Return user details
            AuthResponse response = new AuthResponse(userId, user.getName(), email, role);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "user", response));
        } catch (Exception e) {
            logger.error("Token verification error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token verification failed"));
        }
    }

    /**
     * Refresh token (get a new token with extended expiration)
     * 
     * @param request Map containing the old token
     * @return New JWT token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String oldToken = request.get("token");

        if (oldToken == null || oldToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Token is required"));
        }

        try {
            // Validate old token
            if (!jwtUtil.validateToken(oldToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token"));
            }

            // Extract user details from old token
            Long userId = jwtUtil.extractUserId(oldToken);
            String email = jwtUtil.extractUsername(oldToken);
            String role = jwtUtil.extractRole(oldToken);

            // Verify user still exists
            UserEntity user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }

            // Generate new token
            String newToken = jwtUtil.generateToken(userId, email, role);

            return ResponseEntity.ok(Map.of(
                    "token", newToken,
                    "message", "Token refreshed successfully"));
        } catch (Exception e) {
            logger.error("Token refresh error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token refresh failed"));
        }
    }
}