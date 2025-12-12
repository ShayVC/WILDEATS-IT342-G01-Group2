package com.wildeats.onlinecanteen.controller;

import java.util.*;
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
import com.wildeats.onlinecanteen.service.NotificationService;

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

    @Autowired
    private NotificationService notificationService;

    /** Handle validation errors globally */
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

    /** Extract userId from JWT */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getPrincipal() instanceof Long)
                ? (Long) auth.getPrincipal()
                : null;
    }

    // ===============================
    // PUBLIC SHOP ENDPOINTS
    // ===============================

    @GetMapping
    public ResponseEntity<?> getAllShops() {
        logger.info("GET request to fetch all operational shops");
        List<ShopEntity> shops = shopService.getAllOperationalShops();
        List<ShopResponse> shopDTOs = shops.stream().map(ShopResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(shopDTOs);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getShopsByStatus(@PathVariable String status) {
        logger.info("GET request to fetch shops with status: {}", status);
        try {
            ShopEntity.Status shopStatus = ShopEntity.Status.valueOf(status.toUpperCase());
            List<ShopEntity> shops = shopService.getShopsByStatus(shopStatus);
            List<ShopResponse> shopDTOs = shops.stream().map(ShopResponse::new).collect(Collectors.toList());
            return ResponseEntity.ok(shopDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid status: " + status));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShopById(@PathVariable Long id) {
        logger.info("GET request to fetch shop with ID: {}", id);
        ShopEntity shop = shopService.getShopById(id);
        if (shop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Shop not found"));
        if (shop.getStatus() != ShopEntity.Status.ACTIVE)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Shop is not active"));
        return ResponseEntity.ok(new ShopResponse(shop));
    }

    @GetMapping("/my-shops")
    public ResponseEntity<?> getMyShops() {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch shops for user with ID: {}", userId);

        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));

        UserEntity user = userService.getUserById(userId);
        if (user == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));

        List<ShopEntity> shops = shopService.getShopsByOwnerId(userId);
        List<ShopResponse> shopDTOs = shops.stream().map(ShopResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(shopDTOs);
    }

    // ===============================
    // CREATE / UPDATE SHOP
    // ===============================

    @PostMapping
    public ResponseEntity<?> createShop(@Valid @RequestBody CreateShopRequest request) {
        Long userId = getCurrentUserId();
        logger.info("POST request to create a new shop from user with ID: {}", userId);

        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));

        UserEntity user = userService.getUserById(userId);
        if (user == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));

        try {
            ShopEntity.Location location;
            try {
                location = ShopEntity.Location.fromDisplayName(request.getLocation());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message",
                        "Invalid location. Must be one of: JHS Canteen, Main Canteen, Preschool Canteen, Frontgate, Backgate"));
            }

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
            logger.info("Shop created with ID: {} and status: {}", createdShop.getShopId(), createdShop.getStatus());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "shop", new ShopResponse(createdShop),
                    "message", "Shop application submitted successfully! Awaiting admin approval."));
        } catch (Exception e) {
            logger.error("Error creating shop: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create shop: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> updateShop(@PathVariable Long id, @Valid @RequestBody ShopEntity shop) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to update shop with ID: {} from user with ID: {}", id, userId);

        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));

        UserEntity user = userService.getUserById(userId);
        if (user == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));

        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Shop not found"));

        if (!shopService.isShopOwnedByUser(userId, id))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only update your own shops"));

        shop.setShopId(id);
        shop.setOwner(existingShop.getOwner());
        shop.setStatus(existingShop.getStatus());
        shop.setCreatedAt(existingShop.getCreatedAt());

        if (shop.getShopName() == null)
            shop.setShopName(existingShop.getShopName());

        ShopEntity updatedShop = shopService.updateShop(shop);
        return ResponseEntity.ok(new ShopResponse(updatedShop));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyShopApplications() {
        Long userId = getCurrentUserId();
        logger.info("GET request to fetch shop applications for user with ID: {}", userId);

        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));

        UserEntity user = userService.getUserById(userId);
        if (user == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));

        List<ShopEntity> shops = shopService.getShopsByOwnerId(userId);
        List<ShopResponse> shopDTOs = shops.stream().map(ShopResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(shopDTOs);
    }

    // ===============================
    // SHOP DOCUMENTS
    // ===============================

    @PostMapping("/{shopId}/documents")
    @PreAuthorize("hasRole('SELLER') or hasRole('CUSTOMER')")
    public ResponseEntity<?> uploadShopDocuments(@PathVariable Long shopId,
            @RequestParam("files") MultipartFile[] files) {
        Long userId = getCurrentUserId();
        logger.info("POST request to upload documents for shop {} from user {}", shopId, userId);

        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));

        if (!shopService.isShopOwnedByUser(userId, shopId))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only upload documents for your own shops"));

        try {
            List<String> uploadedFiles = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    uploadedFiles.add(file.getOriginalFilename());
                    logger.info("Received file: {}", file.getOriginalFilename());
                }
            }
            return ResponseEntity.ok(Map.of("message", "Documents uploaded successfully", "files", uploadedFiles));
        } catch (Exception e) {
            logger.error("Error uploading documents for shop {}: {}", shopId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload documents"));
        }
    }

    // ===============================
    // SELLER ACTIONS
    // ===============================

    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> toggleShopStatus(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("PUT request to toggle status for shop {} by user {}", id, userId);

        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));

        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Shop not found"));

        if (!shopService.isShopOwnedByUser(userId, id))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only toggle status for your own shops"));

        try {
            ShopEntity updatedShop = shopService.toggleShopOpenStatus(id);
            return ResponseEntity.ok(new ShopResponse(updatedShop));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> deleteShop(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("DELETE request for shop {} by user {}", id, userId);

        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));

        ShopEntity existingShop = shopService.getShopById(id);
        if (existingShop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Shop not found"));

        if (!shopService.isShopOwnedByUser(userId, id))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only delete your own shops"));

        shopService.softDeleteShop(id);
        return ResponseEntity.ok(Map.of("message", "Shop deleted successfully"));
    }

    // ===============================
    // ADMIN ACTIONS
    // ===============================

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllShopsAdmin() {
        logger.info("Admin fetching all shops");
        List<ShopEntity> shops = shopService.getAllShops();
        List<ShopResponse> shopDTOs = shops.stream().map(ShopResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(shopDTOs);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveShop(@PathVariable Long id) {
        logger.info("Admin approving shop {}", id);
        ShopEntity shop = shopService.getShopById(id);
        if (shop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Shop not found"));

        try {
            ShopEntity approvedShop = shopService.approveShop(id);

            UserEntity owner = approvedShop.getOwner();
            if (!owner.isSeller()) {
                userService.addRoleToUser(owner.getUserId(), "SELLER");
                logger.info("Granted SELLER role to user {} for shop {}", owner.getUserId(), id);
            }

            // send notification
            notificationService.createNotification(
                    owner.getUserId(),
                    "Your shop '" + approvedShop.getShopName() + "' has been APPROVED!");

            return ResponseEntity.ok(Map.of("shop", new ShopResponse(approvedShop),
                    "message", "Shop approved and owner granted seller privileges"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectShop(@PathVariable Long id) {
        logger.info("Admin rejecting shop {}", id);
        ShopEntity shop = shopService.getShopById(id);
        if (shop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Shop not found"));

        ShopEntity rejectedShop = shopService.rejectShop(id);

        notificationService.createNotification(
                rejectedShop.getOwner().getUserId(),
                "Your shop '" + rejectedShop.getShopName() + "' was REJECTED by the admin.");

        return ResponseEntity.ok(new ShopResponse(rejectedShop));
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> suspendShop(@PathVariable Long id) {
        logger.info("Admin suspending shop {}", id);
        ShopEntity shop = shopService.getShopById(id);
        if (shop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Shop not found"));

        try {
            ShopEntity suspendedShop = shopService.suspendShop(id);
            return ResponseEntity.ok(new ShopResponse(suspendedShop));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> closeShop(@PathVariable Long id) {
        logger.info("Admin closing shop {}", id);
        ShopEntity shop = shopService.getShopById(id);
        if (shop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Shop not found"));

        try {
            ShopEntity closedShop = shopService.closeShop(id);
            return ResponseEntity.ok(new ShopResponse(closedShop));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}