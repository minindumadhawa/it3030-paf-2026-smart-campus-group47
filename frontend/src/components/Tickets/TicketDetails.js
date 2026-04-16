import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, User, Mail, MapPin, Phone, CheckCircle, XCircle, Clock, AlertCircle, LogOut } from 'lucide-react';
import ticketService from '../../services/ticketService';
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTicket(id, parsedUser.id, parsedUser.role);
    } else {
      navigate('/login');
    }
  }, [id, navigate]);

  const fetchTicket = async (ticketId, userId, role) => {
    setLoading(true);
    try {
      const data = await ticketService.getTicketById(ticketId, userId, role);
      setTicket(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
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
          <div className="details-card">
            <div className="details-header">
              <div>
                <p className="ticket-id-label">Ticket ID: #{ticket.id}</p>
                <h1 className="ticket-title-heading">{ticket.category.replace('_', ' ')}</h1>
              </div>
              <span className={`status-badge-large status-${ticket.status.toLowerCase().replace('_', '-')}`} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                {statusIcons[ticket.status]} {ticket.status.replace('_', ' ')}
              </span>
            </div>

            <div className="details-body">
              <div className="details-grid">
                {/* Description */}
                <div className="detail-block full-width">
                  <p className="detail-label">Issue Description</p>
                  <p className="detail-value" style={{fontSize: '1.2rem', whiteSpace: 'pre-line'}}>{ticket.description}</p>
                </div>

                {/* Priority */}
                <div className="detail-block">
                  <p className="detail-label">Priority Level</p>
                  <span className="priority-badge-large">
                    <AlertCircle size={18} style={{color: 'var(--primary-orange)'}}/> {ticket.priority}
                  </span>
                </div>

                {/* Location */}
                <div className="detail-block">
                  <p className="detail-label">Location / Resource</p>
                  <p className="detail-value">
                    <MapPin size={18} style={{marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary-orange)'}}/>
                    {ticket.locationOrResource || 'Not specified'}
                  </p>
                </div>

                {/* Submitted By */}
                <div className="detail-block">
                  <p className="detail-label">Submitted By</p>
                  <p className="detail-value">
                    <User size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                    {ticket.userFullName}
                  </p>
                  <p className="detail-sub">
                    <Mail size={14} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                    {ticket.userEmail}
                  </p>
                </div>

                {/* Contact */}
                <div className="detail-block">
                  <p className="detail-label">Preferred Contact</p>
                  <p className="detail-value">
                    <Phone size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                    {ticket.preferredContactDetails || 'Default (Email)'}
                  </p>
                </div>

                {/* Timestamps */}
                <div className="detail-block">
                  <p className="detail-label">Created On</p>
                  <p className="detail-value">
                    <Calendar size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>

                <div className="detail-block">
                  <p className="detail-label">Last Updated</p>
                  <p className="detail-value">
                    <Clock size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                    {formatDate(ticket.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Rejection/Resolution Sections */}
              {ticket.status === 'REJECTED' && (
                <div className="info-block rejected-block">
                  <p className="detail-label" style={{color: '#991b1b'}}>Rejection Reason</p>
                  <p className="detail-value">{ticket.rejectionReason || 'No reason provided.'}</p>
                </div>
              )}

              {ticket.status === 'RESOLVED' && (
                <div className="info-block resolved-block">
                  <p className="detail-label" style={{color: '#065f46'}}>Resolution Notes</p>
                  <p className="detail-value">{ticket.resolutionNotes || 'Task completed.'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TicketDetails;
