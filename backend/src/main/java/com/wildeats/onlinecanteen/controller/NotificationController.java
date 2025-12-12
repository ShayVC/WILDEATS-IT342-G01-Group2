package com.wildeats.onlinecanteen.controller;

import com.wildeats.onlinecanteen.service.NotificationService;
import com.wildeats.onlinecanteen.entity.NotificationEntity;
import com.wildeats.onlinecanteen.service.UserService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(
            NotificationService notificationService,
            UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal instanceof Long ? (Long) principal : null;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications() {
        Long userId = getCurrentUserId();
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        List<NotificationEntity> notifs = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifs);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok("Marked read");
    }
}
