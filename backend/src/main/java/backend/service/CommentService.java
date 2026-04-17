package backend.service;

import backend.dto.CommentRequest;
import backend.dto.CommentResponse;
import backend.exception.TicketNotFoundException;
import backend.exception.UnauthorizedException;
import backend.exception.ValidationException;
import backend.model.Comment;
import backend.model.Ticket;
import backend.model.User;
import backend.repository.CommentRepository;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
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

    public CommentResponse addComment(Long ticketId, CommentRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ValidationException("Comment content cannot be empty.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new TicketNotFoundException("User not found with id: " + request.getUserId()));

        Comment comment = new Comment();
        comment.setContent(request.getContent().trim());
        comment.setTicket(ticket);
        comment.setUser(user);

        return CommentResponse.fromEntity(commentRepository.save(comment));
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

        if (!comment.getUser().getId().equals(request.getUserId()) && !"ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new UnauthorizedException("Access denied. You can only update your own comments.");
        }

        comment.setContent(request.getContent().trim());
        return CommentResponse.fromEntity(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId, Long userId, String role) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new TicketNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getUser().getId().equals(userId) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new UnauthorizedException("Access denied. You can only delete your own comments.");
        }

        commentRepository.delete(comment);
    }
}
