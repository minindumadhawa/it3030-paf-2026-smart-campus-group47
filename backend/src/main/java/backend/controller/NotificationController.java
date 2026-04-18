package backend.controller;

import backend.model.Notification;
import backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3001")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // GET - Retrieve all notifications for the user
    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsByUser(userId);
        return ResponseEntity.ok(notifications);
    }

    // GET - Retrieve unread notification count
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }

    // PUT - Mark a notification as read
    @PutMapping("/{id}")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(updated);
    }

    // PUT - Mark all notifications as read
    @PutMapping("/mark-all-read/{userId}")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // ADDED - Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}