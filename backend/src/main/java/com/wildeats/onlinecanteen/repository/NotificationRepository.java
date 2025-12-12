package com.wildeats.onlinecanteen.repository;

import com.wildeats.onlinecanteen.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserUserIdOrderByCreatedAtDesc(Long userId);
}
