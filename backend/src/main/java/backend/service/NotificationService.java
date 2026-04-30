package backend.service;

import backend.dto.NotificationResponse;
import backend.model.Notification;
import backend.model.NotificationType;
import backend.model.User;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public NotificationResponse createNotification(Long userId, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Notification notification = new Notification(user, title, message, type);
        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(saved);
    }

    public NotificationResponse createNotificationWithContext(Long userId, String title, String message, 
                                                              NotificationType type, Long bookingId, 
                                                              Long ticketId, Long commentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Notification notification = new Notification(user, title, message, type);
        if (bookingId != null) {
            notification.setBookingId(bookingId);
        }
        if (ticketId != null) {
            notification.setTicketId(ticketId);
        }
        if (commentId != null) {
            notification.setCommentId(commentId);
        }

        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(saved);
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        Notification updated = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(updated);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found with id: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }

    public List<NotificationResponse> getNotificationsByType(Long userId, NotificationType type) {
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getBookingNotifications(Long bookingId) {
        return notificationRepository.findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getTicketNotifications(Long ticketId) {
        return notificationRepository.findByTicketIdOrderByCreatedAtDesc(ticketId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void sendBookingApprovalNotification(Long userId, Long bookingId) {
        createNotificationWithContext(
                userId,
                "Booking Approved",
                "Your booking has been approved successfully.",
                NotificationType.BOOKING_APPROVAL,
                bookingId,
                null,
                null
        );
    }

    public void sendBookingRejectionNotification(Long userId, Long bookingId, String reason) {
        createNotificationWithContext(
                userId,
                "Booking Rejected",
                "Your booking has been rejected. Reason: " + reason,
                NotificationType.BOOKING_REJECTION,
                bookingId,
                null,
                null
        );
    }

    public void sendTicketStatusChangeNotification(Long userId, Long ticketId, String newStatus) {
        createNotificationWithContext(
                userId,
                "Ticket Status Updated",
                "Your ticket status has been changed to: " + newStatus,
                NotificationType.TICKET_STATUS_CHANGE,
                null,
                ticketId,
                null
        );
    }

    public void sendNewCommentNotification(Long userId, Long ticketId, Long commentId, String commenterName) {
        createNotificationWithContext(
                userId,
                "New Comment on Ticket",
                commenterName + " has commented on your ticket.",
                NotificationType.NEW_COMMENT,
                null,
                ticketId,
                commentId
        );
    }

    public void sendTicketAssignedNotification(Long technicianId, Long ticketId) {
        createNotificationWithContext(
                technicianId,
                "Ticket Assigned",
                "A new ticket has been assigned to you.",
                NotificationType.TICKET_ASSIGNED,
                null,
                ticketId,
                null
        );
    }

    public void sendTicketRejectionNotification(Long userId, Long ticketId, String reason) {
        createNotificationWithContext(
                userId,
                "Ticket Rejected",
                "Your ticket has been rejected. Reason: " + reason,
                NotificationType.TICKET_REJECTION,
                null,
                ticketId,
                null
        );
    }

    public void sendTicketResolvedNotification(Long userId, Long ticketId) {
        createNotificationWithContext(
                userId,
                "Ticket Resolved",
                "Your ticket has been resolved.",
                NotificationType.TICKET_RESOLVED,
                null,
                ticketId,
                null
        );
    }
}
