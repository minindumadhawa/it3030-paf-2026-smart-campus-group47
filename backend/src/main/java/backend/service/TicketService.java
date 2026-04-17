package backend.service;

import backend.dto.*;
import backend.exception.TicketNotFoundException;
import backend.exception.UnauthorizedException;
import backend.exception.ValidationException;
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

    @Autowired
    private backend.repository.TicketAttachmentRepository attachmentRepository;

    public TicketResponse createTicket(TicketRequest request) {
        if (request.getUserId() == null) throw new ValidationException("User ID is required.");
        if (request.getCategory() == null) throw new ValidationException("Category is required.");
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new ValidationException("Description is required.");
        }
        if (request.getDescription().trim().length() < 10) {
            throw new ValidationException("Description must be at least 10 characters long.");
        }
        if (request.getPriority() == null) throw new ValidationException("Priority is required.");

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new TicketNotFoundException("User not found with id: " + request.getUserId()));

        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setLocationOrResource(request.getLocationOrResource());
        ticket.setPreferredContactDetails(request.getPreferredContactDetails());

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    public List<TicketResponse> getMyTickets(Long userId) {
        return ticketRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getAllTickets(String role) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new UnauthorizedException("Access denied. Only Admins can view all tickets.");
        }
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long ticketId, Long requestingUserId, String role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        if ("ADMIN".equalsIgnoreCase(role)) return TicketResponse.fromEntity(ticket);

        if (!ticket.getUser().getId().equals(requestingUserId)) {
            throw new UnauthorizedException("Access denied. You can only view your own tickets.");
        }

        return mapToResponse(ticket);
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        TicketResponse response = TicketResponse.fromEntity(ticket);
        List<backend.model.TicketAttachment> attachments = attachmentRepository.findByTicketId(ticket.getId());
        response.setAttachments(attachments.stream()
                .map(a -> new TicketAttachmentResponse(a.getId(), a.getFileName(), a.getFileType(), "/api/uploads/tickets/" + a.getFilePath()))
                .collect(java.util.stream.Collectors.toList()));
        return response;
    }

    public TicketResponse assignStaff(Long ticketId, TicketAssignRequest request) {
        if (!"ADMIN".equalsIgnoreCase(request.getAdminRole())) {
            throw new UnauthorizedException("Access denied. Only Admins can assign staff.");
        }
        if (request.getAssignedStaffName() == null || request.getAssignedStaffName().trim().isEmpty()) {
            throw new ValidationException("Staff name is required for assignment.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setAssignedStaffName(request.getAssignedStaffName());
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        return TicketResponse.fromEntity(ticketRepository.save(ticket));
    }

    public TicketResponse updateStatus(Long ticketId, TicketStatusRequest request) {
        if (!"ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new UnauthorizedException("Access denied. Only Admins can update status.");
        }
        if (request.getStatus() == null) throw new ValidationException("Status is required.");

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setStatus(request.getStatus());
        if (request.getStatus() == TicketStatus.REJECTED) {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                throw new ValidationException("Rejection reason is required.");
            }
            ticket.setRejectionReason(request.getRejectionReason());
        }
        return TicketResponse.fromEntity(ticketRepository.save(ticket));
    }

    public TicketResponse updateResolution(Long ticketId, TicketResolutionRequest request) {
        if (!"ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new UnauthorizedException("Access denied. Only Admins can update resolution notes.");
        }
        if (request.getResolutionNotes() == null || request.getResolutionNotes().trim().isEmpty()) {
            throw new ValidationException("Resolution notes are required.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setResolutionNotes(request.getResolutionNotes());
        return TicketResponse.fromEntity(ticketRepository.save(ticket));
    }
}
