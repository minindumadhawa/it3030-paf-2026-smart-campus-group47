import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, LayoutDashboard, LogOut } from 'lucide-react';
import ticketService from '../../services/ticketService';
import './MyTickets.css';

const statusIcons = {
  OPEN: <Clock size={16} />,
  IN_PROGRESS: <Clock size={16} />,
  RESOLVED: <CheckCircle size={16} />,
  REJECTED: <XCircle size={16} />,
  CLOSED: <CheckCircle size={16} />,
};

const borderClasses = {
  OPEN: 'border-open',
  IN_PROGRESS: 'border-in-progress',
  RESOLVED: 'border-resolved',
  REJECTED: 'border-rejected',
  CLOSED: 'border-closed',
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
      setTickets(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
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
            <p style={{color: 'var(--text-muted)'}}>Manage and track your maintenance requests</p>
          </div>
          <button className="submit-btn" onClick={() => navigate('/tickets/create')} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <PlusCircle size={20} /> Create New Ticket
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading your tickets...</div>
        ) : errorMsg ? (
          <div className="alert-error">{errorMsg}</div>
        ) : tickets.length === 0 ? (
          <div className="empty-tickets">
            <LayoutDashboard size={48} style={{color: 'var(--border-color)', marginBottom: '1rem'}}/>
            <h3>No tickets found</h3>
            <p>You haven't submitted any maintenance requests yet.</p>
            <button className="view-btn" onClick={() => navigate('/tickets/create')} style={{maxWidth: '200px', margin: '1.5rem auto 0'}}>
              Submit First Ticket
            </button>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map(ticket => (
              <div key={ticket.id} className={`ticket-card ${borderClasses[ticket.status]}`}>
                <div className="card-header">
                  <span className="category-tag">{ticket.category.replace('_', ' ')}</span>
                  <span className="ticket-id">#{ticket.id}</span>
                </div>
                
                <p className="ticket-desc-preview">{ticket.description}</p>
                
                {ticket.locationOrResource && (
                  <div style={{fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <LayoutDashboard size={14} /> {ticket.locationOrResource}
                  </div>
                )}
                
                <div className="card-footer">
                  <span className={`badge status-${ticket.status.toLowerCase().replace('_', '-')}`} style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    {statusIcons[ticket.status]} {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="priority-badge">
                    <AlertCircle size={14} /> {ticket.priority}
                  </span>
                </div>
                
                <Link to={`/tickets/${ticket.id}`} className="view-btn">
                  View Full Details <ChevronRight size={16} style={{float: 'right', marginTop: '3px'}}/>
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
