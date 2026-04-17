import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, User, Mail, MapPin, Phone, 
  CheckCircle, XCircle, Clock, AlertCircle, LogOut,
  Send, Trash2, Shield
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import commentService from '../../services/commentService';
import CommentSection from './CommentSection';
import './TicketDetails.css';

const statusIcons = {
  OPEN: <Clock size={20} />,
  IN_PROGRESS: <Clock size={20} />,
  RESOLVED: <CheckCircle size={20} />,
  REJECTED: <XCircle size={20} />,
  CLOSED: <CheckCircle size={20} />,
};

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Admin Action States
  const [staffName, setStaffName] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  // Comment States
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTicketData(id, parsedUser.id, parsedUser.role);
    } else {
      navigate('/login');
    }
  }, [id, navigate]);

  const fetchTicketData = async (ticketId, userId, role) => {
    setLoading(true);
    try {
      const ticketData = await ticketService.getTicketById(ticketId, userId, role);
      setTicket(ticketData);
      setStaffName(ticketData.assignedStaffName || '');
      
      const commentData = await commentService.getCommentsByTicket(ticketId);
      setComments(commentData);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAdminActionLoading(true);
    try {
      await ticketService.assignStaff(id, user.id, user.role, staffName);
      alert('Staff assigned successfully!');
      fetchTicketData(id, user.id, user.role);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setAdminActionLoading(true);
    try {
      await ticketService.updateStatus(id, user.id, user.role, selectedStatus, rejectionReason);
      
      if (selectedStatus === 'RESOLVED' && resolutionNotes) {
        await ticketService.updateResolution(id, user.id, user.role, resolutionNotes);
      }
      
      alert('Status updated successfully!');
      setShowStatusModal(false);
      fetchTicketData(id, user.id, user.role);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    try {
      await commentService.addComment(id, user.id, user.role, newComment);
      setNewComment('');
      const commentData = await commentService.getCommentsByTicket(id);
      setComments(commentData);
    } catch (err) {
      alert(err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId, user.id, user.role);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (!user) return <div className="ticket-loading">Authenticating...</div>;

  return (
    <div className="ticket-page-container">
      <nav className="ticket-nav">
        <div className="nav-logo">SLIIT Smart Campus</div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link-btn" onClick={() => navigate('/tickets/my')}>My Tickets</button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="details-main">
        <Link to="/tickets/my" className="back-link">
          <ChevronLeft size={20} /> Back to My Tickets
        </Link>

        {loading ? (
          <div className="loading-spinner">Fetching ticket details...</div>
        ) : errorMsg ? (
          <div className="alert-error">{errorMsg}</div>
        ) : (
          <div className="detail-layout">
            <div className="detail-left-col">
              {/* Ticket Main Info */}
              <div className="details-card">
                <div className="details-header">
                  <div>
                    <p className="ticket-id-label">Ticket ID: #{ticket.id}</p>
                    <h1 className="ticket-title-heading">{ticket.category.replace('_', ' ')}</h1>
                  </div>
                  <span className={`status-badge-large status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                    {statusIcons[ticket.status]} {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="details-body">
                  <div className="detail-block full-width">
                    <p className="detail-label">Issue Description</p>
                    <p className="detail-value description-text">{ticket.description}</p>
                  </div>

                  <div className="details-grid">
                    <div className="detail-block">
                      <p className="detail-label">Priority Level</p>
                      <span className={`priority-pill ${ticket.priority.toLowerCase()}`}>
                        <AlertCircle size={16} /> {ticket.priority}
                      </span>
                    </div>

                    <div className="detail-block">
                      <p className="detail-label">Location / Resource</p>
                      <p className="detail-value">
                        <MapPin size={18} className="icon-orange"/> {ticket.locationOrResource || 'Not specified'}
                      </p>
                    </div>

                    <div className="detail-block">
                      <p className="detail-label">Assigned Staff</p>
                      <p className="detail-value">
                        <Shield size={18} className="icon-orange"/> {ticket.assignedStaffName || 'Unassigned'}
                      </p>
                    </div>

                    <div className="detail-block">
                      <p className="detail-label">Preferred Contact</p>
                      <p className="detail-value">
                        <Phone size={18} className="icon-orange"/> {ticket.preferredContactDetails || 'Default'}
                      </p>
                    </div>
                  </div>

                  {ticket.status === 'REJECTED' && (
                    <div className="info-block rejected-block">
                      <p className="detail-label">Rejection Reason</p>
                      <p className="detail-value">{ticket.rejectionReason}</p>
                    </div>
                  )}

                  {ticket.status === 'RESOLVED' && (
                    <div className="info-block resolved-block">
                      <p className="detail-label">Resolution Notes</p>
                      <p className="detail-value">{ticket.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Correct placement of Comment Section component */}
              <CommentSection ticketId={id} />
            </div>

            {/* Admin Sidebar */}
            {user.role === 'ADMIN' && (
              <div className="admin-sidebar">
                <div className="admin-card">
                  <h3><Shield size={20} /> Management Panel</h3>
                  
                  {/* Assign Staff */}
                  <div className="admin-section">
                    <label>Assign Technician</label>
                    <form onSubmit={handleAssign} className="admin-form-group">
                      <input 
                        type="text" 
                        placeholder="Staff Name"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                      />
                      <button type="submit" disabled={adminActionLoading}>
                        {adminActionLoading ? '...' : 'Assign'}
                      </button>
                    </form>
                  </div>

                  {/* Update Status */}
                  <div className="admin-section">
                    <label>Quick Actions</label>
                    <div className="status-buttons">
                      <button 
                        className="btn-in-progress" 
                        onClick={() => { setSelectedStatus('IN_PROGRESS'); setShowStatusModal(true); }}
                      >In Progress</button>
                      <button 
                        className="btn-resolved" 
                        onClick={() => { setSelectedStatus('RESOLVED'); setShowStatusModal(true); }}
                      >Mark Resolved</button>
                      <button 
                        className="btn-rejected" 
                        onClick={() => { setSelectedStatus('REJECTED'); setShowStatusModal(true); }}
                      >Reject</button>
                    </div>
                  </div>

                  <div className="admin-meta">
                    <p>Submitted by: <strong>{ticket.userFullName}</strong></p>
                    <p>Contact: {ticket.userEmail}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Update Ticket to {selectedStatus}</h2>
            
            {selectedStatus === 'REJECTED' && (
              <div className="modal-field">
                <label>Rejection Reason</label>
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                />
              </div>
            )}

            {selectedStatus === 'RESOLVED' && (
              <div className="modal-field">
                <label>Resolution Notes</label>
                <textarea 
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="What was the core solution?"
                />
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="modal-cancel-btn" 
                onClick={() => setShowStatusModal(false)}
              >Cancel</button>
              <button 
                className="modal-submit-btn" 
                onClick={handleUpdateStatus}
                disabled={adminActionLoading}
              >
                {adminActionLoading ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
