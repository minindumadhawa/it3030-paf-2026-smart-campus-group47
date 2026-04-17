import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock } from 'lucide-react';
import commentService from '../../services/commentService';
import './CommentSection.css';

const CommentSection = ({ ticketId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (ticketId) {
            fetchComments();
        }
    }, [ticketId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const data = await commentService.getCommentsByTicket(ticketId);
            setComments(data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!user) {
            setMessage({ type: 'error', text: 'Please log in to post a comment.' });
            return;
        }

        setActionLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const commentData = {
                userId: user.id,
                role: user.role,
                content: newComment.trim()
            };

            await commentService.addComment(ticketId, commentData);
            setNewComment('');
            setMessage({ type: 'success', text: 'Comment added successfully!' });
            
            // Refresh list
            fetchComments();
            
            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to post comment.' });
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="comment-section-container">
            <h3><MessageSquare size={22} className="icon-orange" /> Discussion & Updates</h3>

            {/* Success/Error Alerts */}
            {message.text && (
                <div className={`comment-alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Comments List */}
            <div className="comments-list">
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>Loading discussion...</p>
                ) : comments.length === 0 ? (
                    <div className="no-comments-msg">
                        No comments yet. Start the conversation!
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                                <span className="comment-author">{comment.userFullName || 'User'}</span>
                                <span className="comment-date">
                                    <Clock size={12} style={{ marginRight: '4px' }} />
                                    {formatDate(comment.createdAt)}
                                </span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <form className="add-comment-form" onSubmit={handleSubmit}>
                <textarea
                    placeholder="Type your comment or update here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                />
                <button 
                    type="submit" 
                    className="comment-submit-btn" 
                    disabled={actionLoading || !newComment.trim()}
                >
                    {actionLoading ? 'Posting...' : (
                        <>
                            <Send size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Post Comment
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
