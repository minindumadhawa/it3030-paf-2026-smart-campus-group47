package backend.service;

import backend.dto.TicketRequest;
import backend.dto.TicketResponse;
import backend.exception.TicketNotFoundException;
import backend.model.Ticket;
import backend.model.TicketStatus;
import backend.model.User;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new ticket
    public TicketResponse createTicket(TicketRequest request) {

        // Validate required fields
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required.");
        }
        if (request.getCategory() == null) {
            throw new IllegalArgumentException("Category is required.");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required.");
        }
        if (request.getPriority() == null) {
            throw new IllegalArgumentException("Priority is required.");
        }

        // Find the user who is creating the ticket
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        // Build the ticket
        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN); // default status
        ticket.setLocationOrResource(request.getLocationOrResource());
        ticket.setPreferredContactDetails(request.getPreferredContactDetails());

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    // Get all tickets created by a specific user
    public List<TicketResponse> getMyTickets(Long userId) {
        List<Ticket> tickets = ticketRepository.findByUserId(userId);
        return tickets.stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get a single ticket by ID
    // Regular users can only view their own tickets, admin can view any
    public TicketResponse getTicketById(Long ticketId, Long requestingUserId, String role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        // Admin can view any ticket
        if ("ADMIN".equalsIgnoreCase(role)) {
            return TicketResponse.fromEntity(ticket);
        }

        // Regular user can only view their own ticket
        if (!ticket.getUser().getId().equals(requestingUserId)) {
            throw new IllegalArgumentException("Access denied. You can only view your own tickets.");
        }

        return TicketResponse.fromEntity(ticket);
    }
}
