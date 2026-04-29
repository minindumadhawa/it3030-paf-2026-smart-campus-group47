package backend.repository;

import backend.model.Notification;
import backend.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);

    List<Notification> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<Notification> findByTicketIdOrderByCreatedAtDesc(Long ticketId);

    List<Notification> findByCommentIdOrderByCreatedAtDesc(Long commentId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.bookingId = :bookingId ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUserAndBooking(@Param("userId") Long userId, @Param("bookingId") Long bookingId);
}
