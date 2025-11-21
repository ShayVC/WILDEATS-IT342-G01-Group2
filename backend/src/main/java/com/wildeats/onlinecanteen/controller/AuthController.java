package com.wildeats.onlinecanteen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.entity.UserEntity.Role;
import com.wildeats.onlinecanteen.security.JwtUtil;
import com.wildeats.onlinecanteen.service.UserService;
import com.wildeats.onlinecanteen.dto.LoginRequest;
import com.wildeats.onlinecanteen.dto.RegisterRequest;
import com.wildeats.onlinecanteen.dto.AuthResponse;

import java.util.Date;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            UserEntity user = userService.findByEmail(loginRequest.getEmail());

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }

            // Check password using BCrypt
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }

            // Update last login time
            user.setLastLogin(new Date());
            userService.updateUser(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

            // Create response with user details and token
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", new AuthResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole().toString()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Log the registration request
            System.out.println("Received registration request for: " + registerRequest.getEmail());

            // Check if email already exists
            if (userService.findByEmail(registerRequest.getEmail()) != null) {
                System.out.println("Email already in use: " + registerRequest.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email already in use"));
            }

            // Validate password strength
            if (registerRequest.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Password must be at least 6 characters long"));
            }

            // Determine role based on email (starts with "shop.")
            Role role = registerRequest.getEmail().startsWith("shop.")
                    ? Role.SELLER
                    : Role.CUSTOMER;

            System.out.println("Creating new user with role: " + role);

            // Create new user with hashed password
            UserEntity newUser = new UserEntity(
                    registerRequest.getName(),
                    registerRequest.getEmail(),
                    passwordEncoder.encode(registerRequest.getPassword()), // Hash password
                    role);

            // Set additional fields
            newUser.setCreatedAt(new Date());
            newUser.setActive(true);

            // Save user to database
            UserEntity savedUser = userService.createUser(newUser);
            System.out.println("User saved to database with ID: " + savedUser.getId());

            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(),
                    savedUser.getRole().toString());

            // Create response with user details and token
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", new AuthResponse(
                    savedUser.getId(),
                    savedUser.getName(),
                    savedUser.getEmail(),
                    savedUser.getRole().toString()));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("Registration failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuthStatus() {
        // This endpoint validates the JWT token via the filter
        return ResponseEntity.ok(Map.of("message", "Authenticated"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // With JWT, logout is handled client-side by removing the token
        // Server-side logout would require token blacklisting (advanced feature)
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}