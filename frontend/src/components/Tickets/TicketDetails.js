import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, User, Mail, MapPin, Phone, 
  CheckCircle, XCircle, Clock, AlertCircle, LogOut,
  Send, Trash2, Shield, Info, ArrowRight
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
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Admin Action States
  const [staffName, setStaffName] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);

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
            <LogOut size={16} style={{marginRight: '5px'}}/> Logout
          </button>
        </div>
      </nav>

      <main className="details-main">
        <Link to="/tickets/my" className="back-link">
          <ChevronLeft size={20} /> Back to My Tickets
        </Link>

        {loading ? (
          <div className="loading-spinner">Fetching record details...</div>
        ) : errorMsg ? (
          <div className="alert-error">{errorMsg}</div>
        ) : (
          <div className="detail-layout">
            <div className="detail-left-col">
              {/* Ticket Hero Section */}
              <div className="details-card">
                <div className="details-header">
                  <div>
                    <p className="ticket-id-label">Record Reference: #{ticket.id}</p>
                    <h1 className="ticket-title-heading">{ticket.category.replace('_', ' ')}</h1>
                  </div>
                  <span className={`status-badge-large status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                    {statusIcons[ticket.status]} {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="details-body">
                  <div className="info-section">
                    <h4><Info size={16} /> Issue Information</h4>
                    <div className="description-box">
                      <p>{ticket.description}</p>
                    </div>
                    
                    <div className="info-sections-grid">
                      <div className="detail-item">
                        <span className="detail-item-label">Priority Level</span>
                        <div className={`detail-item-value priority-${ticket.priority.toLowerCase()}`}>
                          <AlertCircle size={18} /> {ticket.priority}
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-item-label">Submitted On</span>
                        <div className="detail-item-value">
                          <Calendar size={18} className="icon-orange" /> {formatDate(ticket.createdAt)}
                        </div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-item-label">Location / Area</span>
                        <div className="detail-item-value">
                          <MapPin size={18} className="icon-orange" /> {ticket.locationOrResource || 'General Campus'}
                        </div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-item-label">Assigned Technician</span>
                        <div className="detail-item-value">
                          <Shield size={18} className="icon-orange" /> {ticket.assignedStaffName || 'Pending Assignment'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Info */}
                  {(ticket.status === 'REJECTED' || ticket.status === 'RESOLVED') && (
                    <div className="info-section" style={{marginTop: '2rem'}}>
                      <h4><CheckCircle size={16} /> Resolution Information</h4>
                      <div className={`description-box ${ticket.status === 'REJECTED' ? 'rejected-box' : 'resolved-box'}`}>
                        <p><strong>{ticket.status === 'REJECTED' ? 'Rejection Reason:' : 'Resolution Notes:'}</strong></p>
                        <p>{ticket.status === 'REJECTED' ? ticket.rejectionReason : ticket.resolutionNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="info-section" style={{marginTop: '2rem'}}>
                    <h4><Phone size={16} /> Primary Contact</h4>
                    <div className="detail-item-value" style={{background: '#f1f5f9', padding: '1rem', borderRadius: '10px'}}>
                      <Phone size={18} className="icon-orange" /> {ticket.preferredContactDetails || 'Default Contact Information'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discussion Section */}
              <CommentSection ticketId={id} />
            </div>

            {/* Admin Management Sidebar */}
            {user.role === 'ADMIN' && (
              <div className="admin-sidebar">
                <div className="admin-card">
                  <h3><Shield size={22} className="icon-orange" /> Management</h3>
                  
                  <div className="admin-section">
                    <label>Assign Resource</label>
                    <form onSubmit={handleAssign} className="admin-form-group">
                      <input 
                        type="text" 
                        placeholder="Staff / Dept Name"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                      />
                      <button type="submit" disabled={adminActionLoading} className="icon-btn">
                        <ArrowRight size={18} />
                      </button>
                    </form>
                  </div>

                  <div className="admin-section">
                    <label>Lifecycle Actions</label>
                    <div className="status-buttons">
                      <button className="btn-in-progress" onClick={() => { setSelectedStatus('IN_PROGRESS'); setShowStatusModal(true); }}>
                        Set In Progress <ArrowRight size={16} />
                      </button>
                      <button className="btn-resolved" onClick={() => { setSelectedStatus('RESOLVED'); setShowStatusModal(true); }}>
                        Mark Resolved <CheckCircle size={16} />
                      </button>
                      <button className="btn-rejected" onClick={() => { setSelectedStatus('REJECTED'); setShowStatusModal(true); }}>
                        Reject Case <XCircle size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="admin-meta" style={{fontSize: '0.85rem', color: '#64748b'}}>
                    <p>Reporter: <strong>{ticket.userFullName}</strong></p>
                    <p style={{marginTop: '0.25rem'}}>{ticket.userEmail}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{color: '#0b2239', marginBottom: '1rem'}}>Update Ticket State</h2>
            <p style={{color: '#64748b', marginBottom: '2rem'}}>Changing status to <strong>{selectedStatus}</strong>. This update will be logged.</p>
            
            {selectedStatus === 'REJECTED' && (
              <div className="modal-field">
                <label style={{fontWeight: '700', display: 'block', marginBottom: '0.5rem'}}>Formal Rejection Reason</label>
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  style={{width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0'}}
                />
              </div>
            )}

            {selectedStatus === 'RESOLVED' && (
              <div className="modal-field">
                <label style={{fontWeight: '700', display: 'block', marginBottom: '0.5rem'}}>Resolution Summary</label>
                <textarea 
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Summarize the solution provided..."
                  style={{width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0'}}
                />
              </div>
            )}

            <div className="modal-actions" style={{marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button className="cancel-edit-btn" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button 
                className="save-edit-btn" 
                onClick={handleUpdateStatus}
                disabled={adminActionLoading}
              >
                {adminActionLoading ? 'Processing...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
