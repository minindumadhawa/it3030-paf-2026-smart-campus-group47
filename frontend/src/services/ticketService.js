const API_URL = 'http://localhost:8080/api/tickets';

const ticketService = {
    // Create a new ticket
    createTicket: async (ticketData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticketData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create ticket');
        }
        return response.json();
    },

    // Get tickets for logged-in user
    getMyTickets: async (userId) => {
        const response = await fetch(`${API_URL}/my?userId=${userId}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch tickets');
        }
        return response.json();
    },

    // Get a single ticket by ID
    getTicketById: async (id, userId, role) => {
        const response = await fetch(`${API_URL}/${id}?userId=${userId}&role=${role}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch ticket details');
        }
        return response.json();
    },

    // Admin: Assign a staff member to a ticket
    assignStaff: async (id, adminUserId, adminRole, assignedStaffName) => {
        const response = await fetch(`${API_URL}/${id}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminUserId, adminRole, assignedStaffName })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to assign staff');
        }
        return response.json();
    },

    // Admin: Update ticket status
    updateStatus: async (id, userId, role, status, rejectionReason) => {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role, status, rejectionReason })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update status');
        }
        return response.json();
    },

    // Admin: Update resolution notes
    updateResolution: async (id, userId, role, resolutionNotes) => {
        const response = await fetch(`${API_URL}/${id}/resolution`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role, resolutionNotes })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update resolution notes');
        }
        return response.json();
    }
};

export default ticketService;
