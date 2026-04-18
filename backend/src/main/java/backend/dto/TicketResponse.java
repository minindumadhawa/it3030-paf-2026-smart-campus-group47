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
    private String assignedStaffName;
    private Long technicianId;
    private String technicianName;
    private String resolutionDuration;
    private java.util.List<TicketAttachmentResponse> attachments;

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
        response.setAssignedStaffName(ticket.getAssignedStaffName());

        if (ticket.getUser() != null) {
            response.setUserId(ticket.getUser().getId());
            response.setUserFullName(ticket.getUser().getFullName());
            response.setUserEmail(ticket.getUser().getEmail());
        }

        if (ticket.getTechnician() != null) {
            response.setTechnicianId(ticket.getTechnician().getId());
            response.setTechnicianName(ticket.getTechnician().getFullName());
            // Optionally sync assignedStaffName for backward compatibility
            response.setAssignedStaffName(ticket.getTechnician().getFullName());
        }

        // Calculate resolution duration if resolved
        if (ticket.getResolvedAt() != null && ticket.getCreatedAt() != null) {
            java.time.Duration duration = java.time.Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt());
            long days = duration.toDays();
            long hours = duration.toHours() % 24;
            long minutes = duration.toMinutes() % 60;

            StringBuilder sb = new StringBuilder();
            if (days > 0) sb.append(days).append("d ");
            if (hours > 0) sb.append(hours).append("h ");
            if (minutes > 0 || sb.length() == 0) sb.append(minutes).append("m");
            response.setResolutionDuration(sb.toString().trim());
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

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public String getResolutionDuration() { return resolutionDuration; }
    public void setResolutionDuration(String resolutionDuration) { this.resolutionDuration = resolutionDuration; }

    public java.util.List<TicketAttachmentResponse> getAttachments() { return attachments; }
    public void setAttachments(java.util.List<TicketAttachmentResponse> attachments) { this.attachments = attachments; }
}
