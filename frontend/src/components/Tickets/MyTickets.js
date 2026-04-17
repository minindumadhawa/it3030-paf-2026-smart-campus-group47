import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, Clock, CheckCircle, XCircle, 
  AlertCircle, ChevronRight, LayoutDashboard, LogOut,
  MapPin, Calendar
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import './MyTickets.css';

const statusIcons = {
  OPEN: <Clock size={16} />,
  IN_PROGRESS: <Clock size={16} />,
  RESOLVED: <CheckCircle size={16} />,
  REJECTED: <XCircle size={16} />,
  CLOSED: <CheckCircle size={16} />,
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
      const data = await ticketService.getMyTickets(userId);
      // Sort by latest first
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sortedData);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (!user) return <div className="ticket-loading">Authenticating...</div>;

  return (
    <div className="ticket-page-container">
      <nav className="ticket-nav">
        <div className="nav-logo">SLIIT Smart Campus</div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            <LogOut size={16} style={{marginRight: '5px'}}/> Logout
          </button>
        </div>
      </nav>

      <main className="tickets-list-container">
        <div className="tickets-header">
          <div>
            <h1>My Tickets</h1>
            <p>Track and manage your maintenance requests in real-time</p>
          </div>
          <button className="submit-btn" onClick={() => navigate('/tickets/create')}>
            <PlusCircle size={20} /> New Ticket
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading your requests...</div>
        ) : errorMsg ? (
          <div className="alert-error">{errorMsg}</div>
        ) : tickets.length === 0 ? (
          <div className="empty-tickets">
            <LayoutDashboard size={64} style={{marginBottom: '1.5rem', opacity: 0.2}}/>
            <h3>No requests yet</h3>
            <p>Need help with something? Create your first ticket now.</p>
            <button className="view-btn" onClick={() => navigate('/tickets/create')} style={{maxWidth: '240px', margin: '2rem auto 0', background: '#0b2239', color: 'white'}}>
              Submit a Request
            </button>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="card-header">
                  <span className="category-tag">{ticket.category.replace('_', ' ')}</span>
                  <span className="ticket-id">#{ticket.id}</span>
                </div>
                
                <p className="ticket-desc-preview">{ticket.description}</p>
                
                <div className="card-meta">
                  <div className="meta-item">
                    <MapPin size={14} /> {ticket.locationOrResource || 'N/A'}
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} /> {formatDate(ticket.createdAt)}
                  </div>
                </div>
                
                <div className="card-footer">
                  <span className={`badge status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                    {statusIcons[ticket.status]} {ticket.status.replace('_', ' ')}
                  </span>
                  <div className="priority-badge">
                    <AlertCircle size={14} /> {ticket.priority}
                  </div>
                </div>
                
                <Link to={`/tickets/${ticket.id}`} className="view-btn">
                  View Case Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTickets;
