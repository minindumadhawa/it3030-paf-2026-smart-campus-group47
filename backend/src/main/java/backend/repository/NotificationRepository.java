package backend.repository;

import backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // GET - Retrieve user notifications (newest first)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // GET - Count unread notifications for user
    long countByUserIdAndReadFalse(Long userId);

    // GET - Retrieve unread notifications for user
    List<Notification> findByUserIdAndReadFalse(Long userId);
}