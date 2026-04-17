package backend.controller;

import backend.dto.CommentRequest;
import backend.dto.CommentResponse;
import backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // POST /api/tickets/{ticketId}/comments
    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long ticketId,
            @RequestBody CommentRequest request) {
        CommentResponse response = commentService.addComment(ticketId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET /api/tickets/{ticketId}/comments
    @GetMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByTicket(@PathVariable Long ticketId) {
        List<CommentResponse> comments = commentService.getCommentsByTicket(ticketId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    // PUT /api/comments/{commentId}
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        CommentResponse response = commentService.updateComment(commentId, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // DELETE /api/comments/{commentId}
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId,
            @RequestParam String role) {
        commentService.deleteComment(commentId, userId, role);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
