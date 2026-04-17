package backend.controller;

import backend.dto.CommentRequest;
import backend.dto.CommentResponse;
import backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // POST /api/tickets/{ticketId}/comments
    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long ticketId,
            @RequestBody CommentRequest request) {
        try {
            CommentResponse response = commentService.addComment(ticketId, request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // GET /api/tickets/{ticketId}/comments
    @GetMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByTicket(@PathVariable Long ticketId) {
        List<CommentResponse> comments = commentService.getCommentsByTicket(ticketId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    // PUT /api/comments/{commentId}
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        try {
            CommentResponse response = commentService.updateComment(commentId, request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        }
    }

    // DELETE /api/comments/{commentId}
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId,
            @RequestParam String role) {
        try {
            commentService.deleteComment(commentId, userId, role);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        }
    }
}
