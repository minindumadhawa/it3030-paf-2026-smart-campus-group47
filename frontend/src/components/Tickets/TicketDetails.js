import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, User, Mail, MapPin, Phone, 
  CheckCircle, XCircle, Clock, AlertCircle, LogOut,
  Send, Trash2, Shield, Info, ArrowRight, Image
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import commentService from '../../services/commentService';
import CommentSection from './CommentSection';
import UploadAttachment from './UploadAttachment';
import { useNotification } from '../../context/NotificationContext';
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
  const { showNotification } = useNotification();
  
  // Admin Action States
  const [staffName, setStaffName] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState('');

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
      setLocalStatus(ticketData.status);
      
      // Fetch matching technicians if admin
      if (role === 'ADMIN') {
        fetchMatchingTechnicians(ticketData.category);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingTechnicians = async (category) => {
    try {
      const techList = await ticketService.getTechniciansByCategory(category);
      setTechnicians(techList);
    } catch (err) {
      console.error('Failed to fetch technicians', err);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTechId) {
      showNotification('Please select a technician.', 'warning');
      return;
    }

    setAdminActionLoading(true);
    try {
      await ticketService.assignStaff(id, user.id, user.role, '', selectedTechId, assignmentMessage);
      showNotification('Technician assigned successfully!', 'success');
      setAssignmentMessage('');
      fetchTicketData(id, user.id, user.role);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    const trimmedNotes = resolutionNotes.trim();
    const trimmedReason = rejectionReason.trim();

    if (selectedStatus === 'RESOLVED' && trimmedNotes.length < 10) {
      showNotification('⚠️ Resolution notes are too short. Please provide more detail (min 10 chars).', 'warning');
      return;
    }

    if (selectedStatus === 'REJECTED' && trimmedReason.length < 10) {
      showNotification('⚠️ Rejection reason is too short. Please provide more detail (min 10 chars).', 'warning');
      return;
    }

    setAdminActionLoading(true);
    try {
      // 1. Update Status
      await ticketService.updateStatus(id, user.id, user.role, selectedStatus, trimmedReason);
      
      // 2. Update Resolution if applicable
      if (selectedStatus === 'RESOLVED') {
        await ticketService.updateResolution(id, user.id, user.role, trimmedNotes);
      }
      
      // 3. Post formal comment
      if (selectedStatus === 'REJECTED' || selectedStatus === 'RESOLVED') {
        const finalNote = selectedStatus === 'REJECTED' ? trimmedReason : trimmedNotes;
        await commentService.addComment(id, {
          userId: user.id,
          role: user.role,
          content: `🔔 [${selectedStatus}] ${finalNote}`
        });
      }
      
      showNotification(`Success: Ticket status changed to ${selectedStatus}`, 'success');
      setShowStatusModal(false);
      setResolutionNotes('');
      setRejectionReason('');
      fetchTicketData(id, user.id, user.role);
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    setAdminActionLoading(true);
    try {
      await ticketService.updateStatus(id, user.id, user.role, newStatus, '');
      
      // Post a simple comment for progress tracking
      if (newStatus === 'IN_PROGRESS') {
        await commentService.addComment(id, {
          userId: user.id,
          role: user.role,
          content: `⚙️ Ticket is now IN PROGRESS.`
        });
      }

      showNotification(`Success: Ticket status changed to ${newStatus}`, 'success');
      fetchTicketData(id, user.id, user.role);
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const cancelUpdate = () => {
    setLocalStatus(ticket.status);
    setShowStatusModal(false);
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
          {user.role === 'TECHNICIAN' ? (
            <button className="nav-link-btn" onClick={() => navigate('/technician-dashboard')}>Technician Portal</button>
          ) : (
            <>
              <button className="nav-link-btn" onClick={() => navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard')}>Dashboard</button>
              <button className="nav-link-btn" onClick={() => navigate(user.role === 'ADMIN' ? '/admin/tickets' : '/tickets/my')}>
                {user.role === 'ADMIN' ? 'All Tickets' : 'My Tickets'}
              </button>
            </>
          )}
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            <LogOut size={16} style={{marginRight: '5px'}}/> Logout
          </button>
        </div>
      </nav>

      <main className="details-main">
        <Link 
          to={user.role === 'ADMIN' ? '/admin/tickets' : user.role === 'TECHNICIAN' ? '/technician-dashboard' : '/tickets/my'} 
          className="back-link"
        >
          <ChevronLeft size={20} /> Back to {user.role === 'ADMIN' ? 'Tickets Portal' : user.role === 'TECHNICIAN' ? 'My Assignments' : 'My Tickets'}
        </Link>

        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner"></div>
            <p>Fetching record details...</p>
          </div>
        ) : errorMsg ? (
          <div className="alert-error">
            <AlertCircle size={20} /> {errorMsg}
          </div>
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

            {/* Evidence & Upload Sidebar (for Student/Reporter) */}
            <div className="admin-sidebar" style={{marginTop: user.role === 'ADMIN' ? '2rem' : '0'}}>
              <div className="admin-card">
                <h3><Image size={20} className="icon-orange" /> Attached Evidence</h3>
                
                <div className="attachment-gallery">
                  {ticket.attachments && ticket.attachments.length > 0 ? (
                    <div className="image-grid-small">
                      {ticket.attachments.map(att => (
                        <a key={att.id} href={`http://localhost:8080${att.url}`} target="_blank" rel="noreferrer" className="img-thumb-link">
                          <img src={`http://localhost:8080${att.url}`} alt={att.fileName} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state-text">No images attached to this record.</p>
                  )}
                </div>

                {user.role === 'USER' && ticket.status === 'OPEN' && (
                  <UploadAttachment 
                    ticketId={id} 
                    currentAttachmentCount={ticket.attachments?.length || 0}
                    onUploadSuccess={() => fetchTicketData(id, user.id, user.role)}
                  />
                )}
              </div>
            </div>

            {/* Admin Management Sidebar */}
            {user.role === 'ADMIN' && (
              <div className="admin-sidebar">
                <div className="admin-card">
                  <h3><Shield size={22} className="icon-orange" /> Management</h3>
                  
                  <div className="admin-section">
                    <label>Assign Specialized Technician</label>
                    <form onSubmit={handleAssign} className="admin-form-group" style={{ flexDirection: 'column', gap: '10px' }}>
                      <select 
                        value={selectedTechId}
                        onChange={(e) => setSelectedTechId(e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          borderRadius: '10px', 
                          border: '1px solid #e2e8f0', 
                          background: '#f8fafc',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Select Technician...</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                        ))}
                      </select>
                      
                      <textarea
                        placeholder="Add a message for the technician (optional)..."
                        value={assignmentMessage}
                        onChange={(e) => setAssignmentMessage(e.target.value)}
                        style={{ 
                          width: '100%', 
                          minHeight: '60px', 
                          padding: '10px', 
                          borderRadius: '10px', 
                          border: '1px solid #e2e8f0', 
                          background: '#f8fafc', 
                          fontSize: '13px', 
                          resize: 'vertical',
                          fontFamily: "'Inter', sans-serif"
                        }}
                      />

                      <button 
                        type="submit" 
                        disabled={adminActionLoading || !selectedTechId} 
                        className="save-edit-btn"
                        style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Send size={16} /> Confirm Assignment
                      </button>
                    </form>
                  </div>

                  <div className="admin-section">
                    <label>Update Lifecycle Status</label>
                    <div className="status-dropdown-wrapper">
                      <select 
                        className={`admin-status-select status-${localStatus.toLowerCase().replace('_', '-')}`}
                        value={localStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setLocalStatus(newStatus);
                          
                          setSelectedStatus(newStatus);
                          if (newStatus === 'RESOLVED' || newStatus === 'REJECTED') {
                            setShowStatusModal(true);
                          } else {
                            if (window.confirm(`Change status to ${newStatus.replace('_', ' ')}?`)) {
                              handleQuickStatusUpdate(newStatus);
                            } else {
                              setLocalStatus(ticket.status);
                            }
                          }
                        }}
                        disabled={adminActionLoading}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-meta" style={{fontSize: '0.85rem', color: '#64748b'}}>
                    <p>Reporter: <strong>{ticket.userFullName}</strong></p>
                    <p style={{marginTop: '0.25rem'}}>{ticket.userEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Technician Management Sidebar */}
            {user.role === 'TECHNICIAN' && ticket.technicianId === user.id && (
              <div className="admin-sidebar">
                <div className="admin-card tech-card">
                  <h3><Shield size={22} className="icon-orange" /> Technician Panel</h3>
                  <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem'}}>Manage this task and update resolution.</p>
                  
                  {ticket.status === 'IN_PROGRESS' && (
                    <div className="admin-section">
                      <button 
                        className="quick-resolve-btn"
                        onClick={() => {
                          setSelectedStatus('RESOLVED');
                          setShowStatusModal(true);
                        }}
                        style={{ width: '100%', background: '#F37021', color: 'white', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  )}

                  {ticket.status === 'RESOLVED' && (
                    <p style={{textAlign: 'center', color: '#166534', fontWeight: '700'}}>✅ Work Completed</p>
                  )}
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
              <button className="cancel-edit-btn" onClick={cancelUpdate}>Cancel</button>
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
