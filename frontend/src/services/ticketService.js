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
    }
};

export default ticketService;
