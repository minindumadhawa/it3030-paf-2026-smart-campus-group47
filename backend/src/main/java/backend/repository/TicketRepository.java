package backend.repository;

import backend.model.Ticket;
import backend.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Get all tickets submitted by a specific user
    List<Ticket> findByUserId(Long userId);

    // Get all tickets with a specific status (useful for admin filtering)
    List<Ticket> findByStatus(TicketStatus status);

    // Get all tickets by a specific user filtered by status
    List<Ticket> findByUserIdAndStatus(Long userId, TicketStatus status);

    // Get all tickets assigned to a specific technician
    List<Ticket> findByTechnicianId(Long technicianId);
}
