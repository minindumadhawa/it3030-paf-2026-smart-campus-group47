const API_URL = 'http://localhost:8080/api';

const commentService = {
    // Get all comments for a ticket
    getCommentsByTicket: async (ticketId) => {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch comments');
        }
        return response.json();
    },

    // Add a new comment to a ticket
    addComment: async (ticketId, commentData) => {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to post comment');
        }
        return response.json();
    },

    // Update an existing comment
    updateComment: async (commentId, commentData) => {
        const response = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update comment');
        }
        return response.json();
    },

    // Delete a comment
    deleteComment: async (commentId, userId, role) => {
        const response = await fetch(`${API_URL}/comments/${commentId}?userId=${userId}&role=${role}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete comment');
        }
        return true;
    }
};

export default commentService;
