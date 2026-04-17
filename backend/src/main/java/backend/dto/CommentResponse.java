package backend.dto;

import backend.model.Comment;
import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private String content;
    private Long userId;
    private String userFullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommentResponse() {}

    public static CommentResponse fromEntity(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        
        if (comment.getAdmin() != null) {
            response.setUserId(comment.getAdmin().getId());
            response.setUserFullName(comment.getAdmin().getFullName() + " (System Admin)");
        } else if (comment.getUser() != null) {
            response.setUserId(comment.getUser().getId());
            response.setUserFullName(comment.getUser().getFullName());
        }
        
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
