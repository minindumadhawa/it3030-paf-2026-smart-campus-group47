import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, Edit2, Trash2, X, Check } from 'lucide-react';
import commentService from '../../services/commentService';
import './CommentSection.css';

const CommentSection = ({ ticketId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [user, setUser] = useState(null);

    // Editing state
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');

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
            fetchComments();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to post comment.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (commentId) => {
        if (!editContent.trim()) return;
        
        setActionLoading(true);
        try {
            await commentService.updateComment(commentId, {
                userId: user.id,
                role: user.role,
                content: editContent.trim()
            });
            setEditingCommentId(null);
            fetchComments();
            setMessage({ type: 'success', text: 'Comment updated!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            await commentService.deleteComment(commentId, user.id, user.role);
            setComments(comments.filter(c => c.id !== commentId));
            setMessage({ type: 'success', text: 'Comment deleted.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            alert(err.message);
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
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

            {message.text && (
                <div className={`comment-alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

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

                            {editingCommentId === comment.id ? (
                                <div className="edit-comment-form">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="edit-actions">
                                        <button className="cancel-edit-btn" onClick={() => setEditingCommentId(null)}>
                                            <X size={16} /> Cancel
                                        </button>
                                        <button className="save-edit-btn" onClick={() => handleUpdate(comment.id)} disabled={actionLoading}>
                                            <Check size={16} /> Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="comment-text">{comment.content}</p>
                                    {(user && (user.id === comment.userId || user.role === 'ADMIN')) && (
                                        <div className="comment-actions">
                                            <button className="action-btn edit-btn" onClick={() => startEditing(comment)}>
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button className="action-btn delete-btn" onClick={() => handleDelete(comment.id)}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

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
                        <><Send size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Post Comment</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
