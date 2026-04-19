package backend.dto;

import backend.model.TicketStatus;

public class TicketStatusRequest {
    private TicketStatus status;
    private Long userId; // The person making the update
    private String role; // Their role (ADMIN)
    private String rejectionReason;

    public TicketStatusRequest() {}

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
