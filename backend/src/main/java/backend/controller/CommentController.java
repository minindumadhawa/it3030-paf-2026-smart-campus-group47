package backend.controller;

import backend.dto.CommentRequest;
import backend.dto.CommentResponse;
import backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import backend.service.NotificationService;
import backend.service.TicketService;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TicketService ticketService;

    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long ticketId,
            @RequestBody CommentRequest request) {
        CommentResponse response = commentService.addComment(ticketId, request);

        // ADDED - Send a notification to the ticket owner when a comment is added.
        try {
            backend.dto.TicketResponse ticket = ticketService.getTicketById(ticketId, request.getUserId(), "USER");
            if (!ticket.getUserId().equals(request.getUserId())) {
                notificationService.createNotification(
                        ticket.getUserId(),
                        "New comment added on your ticket for '" + ticket.getLocationOrResource() + "'",
                        "NEW_COMMENT"
                );
            }
        } catch (Exception ignored) {}
        return new ResponseEntity<>(commentService.addComment(ticketId, request), HttpStatus.CREATED);
    }

    @GetMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId,
            @RequestParam String role) {
        commentService.deleteComment(commentId, userId, role);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
