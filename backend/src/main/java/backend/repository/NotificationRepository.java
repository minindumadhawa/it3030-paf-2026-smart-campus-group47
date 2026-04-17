package backend.repository;

import backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // User එකෙන් notifications ලබාගන්නවා (අලුත්ම ඒවා පළමුව)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Unread count ගන්නවා
    long countByUserIdAndReadFalse(Long userId);

    // User ගේ unread notifications
    List<Notification> findByUserIdAndReadFalse(Long userId);
}