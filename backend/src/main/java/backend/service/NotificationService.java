package backend.service;

import backend.model.Notification;
import backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Notification create කරන්න (Member 2, 3 use කරනවා)
    public Notification createNotification(Long userId, String message, String type) {
        Notification notification = new Notification(userId, message, type);
        return notificationRepository.save(notification);
    }

    // User ගේ සියලු notifications ගන්නවා
    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Unread count ගන්නවා
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    // Notification එකක් read කරන්න
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    // User ගේ සියලු notifications read කරන්න
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
