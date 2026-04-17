const API_URL = 'http://localhost:8080/api';

const ticketService = {
  // Create a new ticket
  createTicket: async (ticketData) => {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create ticket');
    }
    return response.json();
  },

  // Get all tickets for a specific user (Student)
  getMyTickets: async (userId) => {
    const response = await fetch(`${API_URL}/tickets/my?userId=${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch your tickets');
    }
    return response.json();
  },

  // Get ALL tickets for Admin view
  getAllTickets: async (role) => {
    const response = await fetch(`${API_URL}/tickets?role=${role}`);
    if (!response.ok) {
        throw new Error('Failed to fetch all tickets');
    }
    return response.json();
  },

  // Get ticket by ID with role-based access
  getTicketById: async (id, userId, role) => {
    const response = await fetch(`${API_URL}/tickets/${id}?userId=${userId}&role=${role}`);
    if (!response.ok) {
      if (response.status === 403) throw new Error('You do not have permission to view this ticket');
      throw new Error('Ticket not found');
    }
    return response.json();
  },

  // [Management] Assign a technician/staff member
  assignStaff: async (ticketId, adminId, adminRole, staffName) => {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignedStaffName: staffName,
        adminUserId: adminId,
        adminRole: adminRole
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign staff');
    }
    return response.json();
  },

  // [Management] Update ticket status
  updateStatus: async (ticketId, adminId, adminRole, status, rejectionReason) => {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: status,
        rejectionReason: rejectionReason,
        adminUserId: adminId,
        adminRole: adminRole
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update status');
    }
    return response.json();
  },

  // [Management] Update resolution notes
  updateResolution: async (ticketId, adminId, adminRole, notes) => {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/resolution`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resolutionNotes: notes,
        adminUserId: adminId,
        adminRole: adminRole
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update resolution');
    }
    return response.json();
  },

  // [New] Upload image attachments
  uploadAttachments: async (ticketId, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
      method: 'POST',
      // Note: fetch automatically sets Content-Type to multipart/form-data for FormData
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload attachments');
    }
    return response.json();
  }
};

export default ticketService;
