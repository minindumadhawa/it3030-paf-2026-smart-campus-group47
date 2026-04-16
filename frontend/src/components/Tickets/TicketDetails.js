import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TicketDetails.css';

const statusColors = {
  OPEN: 'status-open',
  IN_PROGRESS: 'status-in-progress',
  RESOLVED: 'status-resolved',
  REJECTED: 'status-rejected',
  CLOSED: 'status-closed',
};

const statusLabels = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CLOSED: 'Closed',
};

const priorityColors = {
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
  URGENT: 'priority-urgent',
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
      const response = await fetch(
        `http://localhost:8080/api/tickets/${ticketId}?userId=${userId}&role=${role}`
      );
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      } else if (response.status === 404) {
        setErrorMsg('Ticket not found.');
      } else if (response.status === 403) {
        setErrorMsg('Access denied. You can only view your own tickets.');
      } else {
        setErrorMsg('Failed to load ticket details.');
      }
    } catch (err) {
      setErrorMsg('Server error. Please make sure the backend is running.');
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
        <div className="nav-logo">Smart Campus Hub</div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/tickets/my')}>My Tickets</button>
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            Logout
          </button>
        </div>
      </nav>

      <main className="details-main">
        <button className="back-btn" onClick={() => navigate('/tickets/my')}>
          ← Back to My Tickets
        </button>

        {loading && <div className="loading-spinner">Loading ticket details...</div>}
        {errorMsg && <div className="alert-error">{errorMsg}</div>}

        {ticket && (
          <div className="details-card">
            <div className="details-header">
              <div>
                <p className="detail-label">Ticket #{ticket.id}</p>
                <h1 className="ticket-title-heading">{ticket.category.replace('_', ' ')}</h1>
              </div>
              <span className={`status-badge ${statusColors[ticket.status]}`}>
                {statusLabels[ticket.status]}
              </span>
            </div>

            <div className="details-grid">
              {/* Description */}
              <div className="detail-block full-width">
                <p className="detail-label">Description</p>
                <p className="detail-value">{ticket.description}</p>
              </div>

              {/* Priority */}
              <div className="detail-block">
                <p className="detail-label">Priority</p>
                <span className={`priority-badge ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>

              {/* Category */}
              <div className="detail-block">
                <p className="detail-label">Category</p>
                <p className="detail-value">{ticket.category.replace('_', ' ')}</p>
              </div>

              {/* Location */}
              {ticket.locationOrResource && (
                <div className="detail-block">
                  <p className="detail-label">Location / Resource</p>
                  <p className="detail-value">📍 {ticket.locationOrResource}</p>
                </div>
              )}

              {/* Preferred Contact */}
              {ticket.preferredContactDetails && (
                <div className="detail-block">
                  <p className="detail-label">Preferred Contact</p>
                  <p className="detail-value">📞 {ticket.preferredContactDetails}</p>
                </div>
              )}

              {/* Submitted By */}
              <div className="detail-block">
                <p className="detail-label">Submitted By</p>
                <p className="detail-value">{ticket.userFullName}</p>
                <p className="detail-sub">{ticket.userEmail}</p>
              </div>

              {/* Created At */}
              <div className="detail-block">
                <p className="detail-label">Created At</p>
                <p className="detail-value">{formatDate(ticket.createdAt)}</p>
              </div>

              {/* Updated At */}
              <div className="detail-block">
                <p className="detail-label">Last Updated</p>
                <p className="detail-value">{formatDate(ticket.updatedAt)}</p>
              </div>
            </div>

            {/* Rejection Reason - only if REJECTED */}
            {ticket.status === 'REJECTED' && ticket.rejectionReason && (
              <div className="info-block rejected-block">
                <p className="detail-label">Rejection Reason</p>
                <p className="detail-value">{ticket.rejectionReason}</p>
              </div>
            )}

            {/* Resolution Notes - only if RESOLVED */}
            {ticket.status === 'RESOLVED' && ticket.resolutionNotes && (
              <div className="info-block resolved-block">
                <p className="detail-label">Resolution Notes</p>
                <p className="detail-value">{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TicketDetails;
