import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyTickets.css';

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

const MyTickets = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchMyTickets(parsedUser.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchMyTickets = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/my?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        setErrorMsg('Failed to load tickets.');
      }
    } catch (err) {
      setErrorMsg('Server error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (!user) return <div className="ticket-loading">Authenticating...</div>;

  return (
    <div className="ticket-page-container">
      <nav className="ticket-nav">
        <div className="nav-logo">Smart Campus Hub</div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="my-tickets-main">
        <div className="my-tickets-header">
          <div>
            <h1>My Tickets</h1>
            <p>Track all your submitted maintenance and incident tickets</p>
          </div>
          <button className="new-ticket-btn" onClick={() => navigate('/tickets/create')}>
            + Submit New Ticket
          </button>
        </div>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}

        {loading ? (
          <div className="loading-spinner">Loading your tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">🎫</div>
            <h3>No tickets yet</h3>
            <p>You haven't submitted any tickets. Report an issue to get started.</p>
            <button className="new-ticket-btn" onClick={() => navigate('/tickets/create')}>
              Submit Your First Ticket
            </button>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-card-top">
                  <span className="ticket-category">{ticket.category.replace('_', ' ')}</span>
                  <span className={`priority-badge ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>

                <p className="ticket-description">
                  {ticket.description.length > 100
                    ? ticket.description.substring(0, 100) + '...'
                    : ticket.description}
                </p>

                {ticket.locationOrResource && (
                  <p className="ticket-location">📍 {ticket.locationOrResource}</p>
                )}

                <div className="ticket-card-footer">
                  <span className={`status-badge ${statusColors[ticket.status]}`}>
                    {statusLabels[ticket.status]}
                  </span>
                  <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                </div>

                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTickets;
