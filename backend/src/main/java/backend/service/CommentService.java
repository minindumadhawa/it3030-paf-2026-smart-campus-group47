package backend.service;

import backend.dto.CommentRequest;
import backend.dto.CommentResponse;
import backend.exception.TicketNotFoundException;
import backend.exception.UnauthorizedException;
import backend.exception.ValidationException;
import backend.model.Comment;
import backend.model.Ticket;
import backend.model.User;
import backend.model.Admin;
import backend.model.Technician;
import backend.repository.AdminRepository;
import backend.repository.CommentRepository;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import backend.repository.TechnicianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private NotificationService notificationService;

    public CommentResponse addComment(Long ticketId, CommentRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ValidationException("Comment content cannot be empty.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        Comment comment = new Comment();
        comment.setContent(request.getContent().trim());
        comment.setTicket(ticket);
        
        String commenterName = null;
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            Admin admin = adminRepository.findById(request.getUserId())
                    .orElseThrow(() -> new TicketNotFoundException("Admin not found with id: " + request.getUserId()));
            comment.setAdmin(admin);
            commenterName = admin.getFullName();
            // Satistfy NOT NULL db constraint
            comment.setUser(ticket.getUser()); 
        } else if ("TECHNICIAN".equalsIgnoreCase(request.getRole())) {
            Technician tech = technicianRepository.findById(request.getUserId())
                    .orElseThrow(() -> new TicketNotFoundException("Technician not found with id: " + request.getUserId()));
            comment.setTechnician(tech);
            commenterName = tech.getFullName();
            // Satistfy NOT NULL db constraint
            comment.setUser(ticket.getUser());
        } else {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new TicketNotFoundException("User not found with id: " + request.getUserId()));
            comment.setUser(user);
            commenterName = user.getFullName();
        }

        Comment savedComment = commentRepository.save(comment);

        // Send notification to ticket owner if comment is from staff and not from the ticket owner themselves
        if (("ADMIN".equalsIgnoreCase(request.getRole()) || "TECHNICIAN".equalsIgnoreCase(request.getRole())) 
            && !ticket.getUser().getId().equals(request.getUserId())) {
            notificationService.sendNewCommentNotification(ticket.getUser().getId(), ticketId, savedComment.getId(), commenterName);
        }

        return CommentResponse.fromEntity(savedComment);
    }

    public List<CommentResponse> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CommentResponse updateComment(Long commentId, CommentRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ValidationException("Comment content cannot be empty.");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new TicketNotFoundException("Comment not found with id: " + commentId));

        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            if (comment.getAdmin() == null || !comment.getAdmin().getId().equals(request.getUserId())) {
                throw new UnauthorizedException("Access denied. You can only update your own comments.");
            }
        } else if ("TECHNICIAN".equalsIgnoreCase(request.getRole())) {
            if (comment.getTechnician() == null || !comment.getTechnician().getId().equals(request.getUserId())) {
                throw new UnauthorizedException("Access denied. You can only update your own comments.");
            }
        } else {
            if (comment.getUser() == null || !comment.getUser().getId().equals(request.getUserId())) {
                throw new UnauthorizedException("Access denied. You can only update your own comments.");
            }
        }

        comment.setContent(request.getContent().trim());
        return CommentResponse.fromEntity(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId, Long userId, String role) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new TicketNotFoundException("Comment not found with id: " + commentId));

        if ("ADMIN".equalsIgnoreCase(role)) {
            if (comment.getAdmin() == null || !comment.getAdmin().getId().equals(userId)) {
                throw new UnauthorizedException("Access denied. You can only delete your own comments.");
            }
        } else if ("TECHNICIAN".equalsIgnoreCase(role)) {
            if (comment.getTechnician() == null || !comment.getTechnician().getId().equals(userId)) {
                throw new UnauthorizedException("Access denied. You can only delete your own comments.");
            }
        } else {
            if (comment.getUser() == null || !comment.getUser().getId().equals(userId)) {
                throw new UnauthorizedException("Access denied. You can only delete your own comments.");
            }
        }

        commentRepository.delete(comment);
    }
}
