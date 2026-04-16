package backend.dto;

import backend.model.TicketCategory;
import backend.model.TicketPriority;

public class TicketRequest {

    private Long userId;

    private TicketCategory category;

    private String description;

    private TicketPriority priority;

    private String locationOrResource;

    private String preferredContactDetails;

    public TicketRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public String getLocationOrResource() { return locationOrResource; }
    public void setLocationOrResource(String locationOrResource) { this.locationOrResource = locationOrResource; }

    public String getPreferredContactDetails() { return preferredContactDetails; }
    public void setPreferredContactDetails(String preferredContactDetails) { this.preferredContactDetails = preferredContactDetails; }
}
