package com.wildeats.onlinecanteen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.entity.UserEntity.Role;
import com.wildeats.onlinecanteen.service.UserService;
import com.wildeats.onlinecanteen.dto.LoginRequest;
import com.wildeats.onlinecanteen.dto.RegisterRequest;
import com.wildeats.onlinecanteen.dto.AuthResponse;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            UserEntity user = userService.findByEmail(loginRequest.getEmail());
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }
            
            // Simple password check (in a real app, you'd use password hashing)
            if (!user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }
            
            // Update last login time
            user.setLastLogin(new Date());
            userService.updateUser(user);
            
            // Create response with user details (excluding password)
            AuthResponse response = new AuthResponse();
            response.setId(user.getId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole().toString());
            
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
            
            // Determine role based on email (starts with "shop.")
            Role role = registerRequest.getEmail().startsWith("shop.") 
                    ? Role.SELLER 
                    : Role.CUSTOMER;
            
            System.out.println("Creating new user with role: " + role);
            
            // Create new user
            UserEntity newUser = new UserEntity(
                    registerRequest.getName(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    role
            );
            
            // Set additional fields
            newUser.setCreatedAt(new Date());
            newUser.setActive(true);
            
            // Save user to database
            UserEntity savedUser = userService.createUser(newUser);
            System.out.println("User saved to database with ID: " + savedUser.getId());
            
            // Create response with user details (excluding password)
            AuthResponse response = new AuthResponse();
            response.setId(savedUser.getId());
            response.setName(savedUser.getName());
            response.setEmail(savedUser.getEmail());
            response.setRole(savedUser.getRole().toString());
            
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
        // This endpoint would normally validate a JWT token
        // For now, we'll just return a success message
        return ResponseEntity.ok(Map.of("message", "Authenticated"));
    }
}
