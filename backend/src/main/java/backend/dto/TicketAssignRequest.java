package backend.dto;

public class TicketAssignRequest {
    private String assignedStaffName;
    private Long technicianId;
    private Long adminId;
    private Long adminUserId; // Legacy
    private String adminRole;
    private String message;

    public TicketAssignRequest() {}

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public Long getAdminUserId() { return adminUserId; }
    public void setAdminUserId(Long adminUserId) { this.adminUserId = adminUserId; }

    public String getAdminRole() { return adminRole; }
    public void setAdminRole(String adminRole) { this.adminRole = adminRole; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
