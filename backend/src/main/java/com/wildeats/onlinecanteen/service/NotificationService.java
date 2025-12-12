package com.wildeats.onlinecanteen.service;

import com.wildeats.onlinecanteen.entity.NotificationEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.repository.NotificationRepository;
import com.wildeats.onlinecanteen.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public NotificationEntity createNotification(Long userId, String message) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return null;

        NotificationEntity notif = new NotificationEntity();
        notif.setUser(user);
        notif.setMessage(message);
        notif.setCreatedAt(LocalDateTime.now());
        notif.setRead(false);

        return notificationRepository.save(notif);
    }

    public List<NotificationEntity> getUserNotifications(Long userId) {
        return notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
    }

    public void markRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
