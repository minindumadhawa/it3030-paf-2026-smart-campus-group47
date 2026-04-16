package backend.dto;

import backend.model.Ticket;
import backend.model.TicketCategory;
import backend.model.TicketPriority;
import backend.model.TicketStatus;

import java.time.LocalDateTime;

public class TicketResponse {

    private Long id;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String locationOrResource;
    private String preferredContactDetails;
    private String rejectionReason;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User info
    private Long userId;
    private String userFullName;
    private String userEmail;

    public TicketResponse() {}

    // Convenience constructor from Ticket entity
    public static TicketResponse fromEntity(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setCategory(ticket.getCategory());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setLocationOrResource(ticket.getLocationOrResource());
        response.setPreferredContactDetails(ticket.getPreferredContactDetails());
        response.setRejectionReason(ticket.getRejectionReason());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        if (ticket.getUser() != null) {
            response.setUserId(ticket.getUser().getId());
            response.setUserFullName(ticket.getUser().getFullName());
            response.setUserEmail(ticket.getUser().getEmail());
        }

        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getLocationOrResource() { return locationOrResource; }
    public void setLocationOrResource(String locationOrResource) { this.locationOrResource = locationOrResource; }

    public String getPreferredContactDetails() { return preferredContactDetails; }
    public void setPreferredContactDetails(String preferredContactDetails) { this.preferredContactDetails = preferredContactDetails; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
