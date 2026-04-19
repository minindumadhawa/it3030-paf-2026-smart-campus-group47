package backend.dto;

public class TicketResolutionRequest {
    private String resolutionNotes;
    private Long userId;
    private String role;

    public TicketResolutionRequest() {}

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
