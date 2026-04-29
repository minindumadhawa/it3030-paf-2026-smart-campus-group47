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
    private CommentService commentService;

    @Autowired
    private backend.repository.TicketAttachmentRepository attachmentRepository;

    @Autowired
    private backend.repository.TechnicianRepository technicianRepository;

    @Autowired
    private NotificationService notificationService;

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
        return mapToResponse(saved);
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

        if (!"ADMIN".equalsIgnoreCase(role) && !ticket.getUser().getId().equals(requestingUserId)) {
            // Check if the requester is the assigned technician
            if (!"TECHNICIAN".equalsIgnoreCase(role) || ticket.getTechnician() == null || !ticket.getTechnician().getId().equals(requestingUserId)) {
                throw new UnauthorizedException("Access denied. You can only view your own or assigned tickets.");
            }
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
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        if (request.getTechnicianId() != null) {
            backend.model.Technician tech = technicianRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new TicketNotFoundException("Technician not found with id: " + request.getTechnicianId()));
            ticket.setTechnician(tech);
            ticket.setAssignedStaffName(tech.getFullName());
        } else {
            if (request.getAssignedStaffName() == null || request.getAssignedStaffName().trim().isEmpty()) {
                throw new ValidationException("Staff selection is required for assignment.");
            }
            ticket.setAssignedStaffName(request.getAssignedStaffName());
        }

        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setResolvedAt(null); // Clear resolvedAt if reassigned
        Ticket saved = ticketRepository.save(ticket);

        // Send notification to assigned technician
        if (request.getTechnicianId() != null) {
            notificationService.sendTicketAssignedNotification(request.getTechnicianId(), saved.getId());
        }

        // Automatically post assignment message as a comment
        if (request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
            CommentRequest commentRequest = new CommentRequest();
            commentRequest.setUserId(request.getAdminId() != null ? request.getAdminId() : request.getAdminUserId());
            commentRequest.setRole("ADMIN");
            commentRequest.setContent("📌 [Task Assigned to " + saved.getAssignedStaffName() + "]: " + request.getMessage());
            commentService.addComment(saved.getId(), commentRequest);
        }

        return mapToResponse(saved);
    }

    public List<TicketResponse> getTicketsForTechnician(Long technicianId) {
        return ticketRepository.findByTechnicianId(technicianId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse updateStatus(Long ticketId, TicketStatusRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(request.getRole());
        boolean isAssignedTech = "TECHNICIAN".equalsIgnoreCase(request.getRole()) && 
                                 ticket.getTechnician() != null && 
                                 ticket.getTechnician().getId().equals(request.getUserId());

        if (!isAdmin && !isAssignedTech) {
            throw new UnauthorizedException("Access denied. Only Admins or the assigned Technician can update status.");
        }

        if (request.getStatus() == TicketStatus.REJECTED) {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                throw new ValidationException("Rejection reason is required.");
            }
            ticket.setStatus(TicketStatus.CLOSED); // Auto-close upon rejection
            ticket.setRejectionReason(request.getRejectionReason());
        } else {
            ticket.setStatus(request.getStatus());
        }

        // SLA Timer logic: set resolvedAt for terminal states
        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(java.time.LocalDateTime.now());
            }
        } else {
            // If moved back from resolved/closed state, clear the timer
            ticket.setResolvedAt(null);
        }

        Ticket saved = ticketRepository.save(ticket);

        // Send notifications based on status change
        if (request.getStatus() == TicketStatus.IN_PROGRESS) {
            notificationService.sendTicketStatusChangeNotification(ticket.getUser().getId(), saved.getId(), "In Progress");
        } else if (request.getStatus() == TicketStatus.RESOLVED) {
            notificationService.sendTicketResolvedNotification(ticket.getUser().getId(), saved.getId());
        } else if (request.getStatus() == TicketStatus.REJECTED) {
            notificationService.sendTicketRejectionNotification(ticket.getUser().getId(), saved.getId(), request.getRejectionReason());
        }

        return mapToResponse(saved);
    }

    public TicketResponse updateResolution(Long ticketId, TicketResolutionRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(request.getRole());
        boolean isAssignedTech = "TECHNICIAN".equalsIgnoreCase(request.getRole()) && 
                                 ticket.getTechnician() != null && 
                                 ticket.getTechnician().getId().equals(request.getUserId());

        if (!isAdmin && !isAssignedTech) {
            throw new UnauthorizedException("Access denied. Only Admins or the assigned Technician can update resolution notes.");
        }

        ticket.setResolutionNotes(request.getResolutionNotes());
        return mapToResponse(ticketRepository.save(ticket));
    }
}
