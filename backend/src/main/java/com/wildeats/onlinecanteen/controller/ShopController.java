package com.wildeats.onlinecanteen.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.wildeats.onlinecanteen.dto.ShopResponse;
import com.wildeats.onlinecanteen.dto.CreateShopRequest;
import com.wildeats.onlinecanteen.entity.ShopEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.service.ShopService;
import com.wildeats.onlinecanteen.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class ShopController {
    private static final Logger logger = LoggerFactory.getLogger(ShopController.class);

    @Autowired
    private ShopService shopService;

    @Autowired
    private UserService userService;

    /**
     * Global validation exception handler
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

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
     * Get all operational shops (PUBLIC - no auth required)
     * 
     * @return List of all operational shops (ACTIVE and open)
     */
    @GetMapping
    public ResponseEntity<?> getAllShops() {
        logger.info("GET request to fetch all operational shops");
        List<ShopEntity> shops = shopService.getAllOperationalShops();

        // Convert to DTOs
        List<ShopResponse> shopDTOs = shops.stream()
                .map(ShopResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(shopDTOs);
    }

    /**
     * Get all shops with a specific status (PUBLIC)
     * 
     * @param status The status to filter by
     * @return List of shops with the specified status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getShopsByStatus(@PathVariable String status) {
        logger.info("GET request to fetch shops with status: {}", status);

        try {
            ShopEntity.Status shopStatus = ShopEntity.Status.valueOf(status.toUpperCase());
            List<ShopEntity> shops = shopService.getShopsByStatus(shopStatus);

            // Convert to DTOs
            List<ShopResponse> shopDTOs = shops.stream()
                    .map(ShopResponse::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(shopDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid status: " + status));
        }
    }

    /**
     * Get a shop by its ID (PUBLIC - no auth required)
     * 
     * @param id The shop ID
     * @return The shop if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getShopById(@PathVariable Long id) {
        logger.info("GET request to fetch shop with ID: {}", id);

        ShopEntity shop = shopService.getShopById(id);
        if (shop != null && shop.getStatus() == ShopEntity.Status.ACTIVE) {
            // Convert to DTO
            ShopResponse shopDTO = new ShopResponse(shop);
            return ResponseEntity.ok(shopDTO);
        } else if (shop != null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Shop is not currently active"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }
    }

    /**
     * Get shops owned by the current user
     * Any authenticated user can check if they own shops
     * 
     * @return List of shops owned by the user
     */
    @GetMapping("/my-shops")
    public ResponseEntity<?> getMyShops() {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch shops for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        List<ShopEntity> shops = shopService.getShopsByOwnerId(userId);

        // Convert to DTOs
        List<ShopResponse> shopDTOs = shops.stream()
                .map(ShopResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(shopDTOs);
    }

    /**
     * Create a new shop (CUSTOMER authenticated)
     * Shop will be created with PENDING status
     * After admin approves shop, user will receive SELLER role
     * 
     * @param request The shop creation request with all required fields
     * @return The created shop
     */
    @PostMapping
    public ResponseEntity<?> createShop(@Valid @RequestBody CreateShopRequest request) {
        Long userId = getCurrentUserId();
        logger.info("POST request to create a new shop from user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        try {
            // Validate location enum
            ShopEntity.Location location;
            try {
                location = ShopEntity.Location.fromDisplayName(request.getLocation());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message",
                                "Invalid location. Must be one of: JHS Canteen, Main Canteen, Preschool Canteen, Frontgate, Backgate"));
            }

            // Create shop entity
            ShopEntity shop = new ShopEntity();
            shop.setShopName(request.getShopName().trim());
            shop.setShopDescr(request.getShopDescr().trim());
            shop.setShopAddress(request.getShopAddress().trim());
            shop.setLocation(location);
            shop.setContactNumber(request.getContactNumber().trim());
            shop.setStatus(ShopEntity.Status.PENDING);
            shop.setIsOpen(false);
            shop.setOwner(user);

            ShopEntity createdShop = shopService.createShop(shop);

            // Convert to DTO
            ShopResponse shopDTO = new ShopResponse(createdShop);

            logger.info("Shop created with ID: {} and status: {}", createdShop.getShopId(), createdShop.getStatus());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "shop", shopDTO,
                    "message", "Shop application submitted successfully! Awaiting admin approval."));
        } catch (Exception e) {
            logger.error("Error creating shop: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create shop: " + e.getMessage()));
        }
    }

    /**
     * Update an existing shop (SELLER only - must own the shop)
     * 
     * @param id   The shop ID
     * @param shop The updated shop data
     * @return The updated shop
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> updateShop(
            @PathVariable Long id,
            @Valid @RequestBody ShopEntity shop) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to update shop with ID: {} from user with ID: {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        if (!shopService.isShopOwnedByUser(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only update your own shops"));
        }

        shop.setShopId(id);
        shop.setOwner(existingShop.getOwner());
        shop.setStatus(existingShop.getStatus());
        shop.setCreatedAt(existingShop.getCreatedAt());

        if (shop.getShopName() == null) {
            shop.setShopName(existingShop.getShopName());
        }

        ShopEntity updatedShop = shopService.updateShop(shop);

        // Convert to DTO
        ShopResponse shopDTO = new ShopResponse(updatedShop);

        return ResponseEntity.ok(shopDTO);
    }

    /**
     * Get current user's shop applications (including pending ones)
     * 
     * @return List of user's shops with all statuses
     */
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyShopApplications() {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch shop applications for user with ID: {}", userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Get all shops owned by user (any status)
        List<ShopEntity> shops = shopService.getShopsByOwnerId(userId);

        // Convert to DTOs
        List<ShopResponse> shopDTOs = shops.stream()
                .map(ShopResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(shopDTOs);
    }

    /**
     * Upload shop documents (business permits, ID, etc.)
     * 
     * @param shopId The ID of the shop
     * @param files  The files to upload
     * @return Success message
     */
    @PostMapping("/{shopId}/documents")
    @PreAuthorize("hasRole('SELLER') or hasRole('CUSTOMER')")
    public ResponseEntity<?> uploadShopDocuments(
            @PathVariable Long shopId,
            @RequestParam("files") MultipartFile[] files) {

        Long userId = getCurrentUserId();
        logger.info("POST request to upload documents for shop {} from user {}", shopId, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        // Verify shop ownership
        if (!shopService.isShopOwnedByUser(userId, shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only upload documents for your own shops"));
        }

        try {
            // TODO: Implement file storage logic
            // For now, just return success
            List<String> uploadedFiles = new ArrayList<>();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // In production, save to cloud storage (AWS S3, Google Cloud Storage, etc.)
                    // For now, just log the file name
                    uploadedFiles.add(file.getOriginalFilename());
                    logger.info("Received file: {}", file.getOriginalFilename());
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Documents uploaded successfully",
                    "files", uploadedFiles));

        } catch (Exception e) {
            logger.error("Error uploading documents for shop {}: {}", shopId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload documents"));
        }
    }

    /**
     * Toggle shop open/closed status (SELLER only)
     * 
     * @param id The shop ID
     * @return The updated shop
     */
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> toggleShopStatus(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to toggle status for shop with ID: {} from user with ID: {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        if (!shopService.isShopOwnedByUser(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only toggle status for your own shops"));
        }

        try {
            ShopEntity updatedShop = shopService.toggleShopOpenStatus(id);

            // Convert to DTO
            ShopResponse shopDTO = new ShopResponse(updatedShop);

            return ResponseEntity.ok(shopDTO);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Soft delete a shop (SELLER only)
     * 
     * @param id The shop ID
     * @return Success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> deleteShop(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("DELETE request for shop with ID: {} from user with ID: {}", id, userId);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        // Check if the shop exists
        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        // Check if the user is the owner of the shop
        if (!shopService.isShopOwnedByUser(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only delete your own shops"));
        }

        // Soft delete the shop (set status to CLOSED)
        shopService.softDeleteShop(id);
        return ResponseEntity.ok(Map.of("message", "Shop deleted successfully"));
    }

    // ============================================
    // ADMIN ENDPOINTS
    // ============================================

    /**
     * Get all shops (any status) - ADMIN only
     * 
     * @return List of all shops
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllShopsAdmin() {
        logger.info("Admin fetching all shops");
        List<ShopEntity> shops = shopService.getAllShops();

        // Convert to DTOs
        List<ShopResponse> shopDTOs = shops.stream()
                .map(ShopResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(shopDTOs);
    }

    /**
     * Approve a shop - ADMIN only
     * Also grants SELLER role to the shop owner
     * 
     * @param id The shop ID
     * @return The approved shop
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveShop(@PathVariable Long id) {
        logger.info("Admin approving shop with ID: {}", id);

        ShopEntity shop = shopService.getShopById(id);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        try {
            ShopEntity approvedShop = shopService.approveShop(id);

            UserEntity owner = approvedShop.getOwner();
            if (!owner.isSeller()) {
                userService.addRoleToUser(owner.getUserId(), "SELLER");
                logger.info("Granted SELLER role to user {} for approved shop {}",
                        owner.getUserId(), id);
            }

            // Convert to DTO
            ShopResponse shopDTO = new ShopResponse(approvedShop);

            return ResponseEntity.ok(Map.of(
                    "shop", shopDTO,
                    "message", "Shop approved and owner granted seller privileges"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Suspend a shop - ADMIN only
     * 
     * @param id The shop ID
     * @return The suspended shop
     */
    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> suspendShop(@PathVariable Long id) {
        logger.info("Admin suspending shop with ID: {}", id);

        ShopEntity shop = shopService.getShopById(id);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        try {
            ShopEntity suspendedShop = shopService.suspendShop(id);

            // Convert to DTO
            ShopResponse shopDTO = new ShopResponse(suspendedShop);

            return ResponseEntity.ok(shopDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Permanently close a shop - ADMIN only
     * 
     * @param id The shop ID
     * @return The closed shop
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> closeShop(@PathVariable Long id) {
        logger.info("Admin closing shop with ID: {}", id);

        ShopEntity shop = shopService.getShopById(id);
        if (shop == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Shop not found"));
        }

        try {
            ShopEntity closedShop = shopService.closeShop(id);

            return ResponseEntity.ok(closedShop);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}