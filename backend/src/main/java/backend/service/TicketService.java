package backend.service;

import backend.dto.*;
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

    // Assign a staff member to a ticket (Admin only)
    public TicketResponse assignStaff(Long ticketId, TicketAssignRequest request) {
        if (!"ADMIN".equalsIgnoreCase(request.getAdminRole())) {
            throw new IllegalArgumentException("Access denied. Only Admins can assign staff.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setAssignedStaffName(request.getAssignedStaffName());
        ticket.setStatus(TicketStatus.IN_PROGRESS); // Auto transition to IN_PROGRESS when assigned

        Ticket updated = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(updated);
    }

    // Update ticket status (Admin only for now)
    public TicketResponse updateStatus(Long ticketId, TicketStatusRequest request) {
        if (!"ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new IllegalArgumentException("Access denied. Only Admins can update status for now.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setStatus(request.getStatus());
        
        if (request.getStatus() == TicketStatus.REJECTED) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        Ticket updated = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(updated);
    }

    // Update resolution notes (Admin only for now)
    public TicketResponse updateResolution(Long ticketId, TicketResolutionRequest request) {
        if (!"ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new IllegalArgumentException("Access denied. Only Admins can update resolution notes.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setResolutionNotes(request.getResolutionNotes());
        
        Ticket updated = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(updated);
    }
}
