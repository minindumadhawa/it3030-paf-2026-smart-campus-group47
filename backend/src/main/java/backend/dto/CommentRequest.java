package backend.dto;

public class CommentRequest {
    private String content;
    private Long userId;
    private String role; // For authorization checks in some cases

    public CommentRequest() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
