import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, Clock, CheckCircle, XCircle, 
  AlertCircle, LayoutDashboard, LogOut,
  ChevronRight, Calendar, User, Info
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import './MyTickets.css';

const MyTickets = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [stats, setStats] = useState({
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    REJECTED: 0
  });

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
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sortedData);
      
      // Calculate Stats
      const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0 };
      data.forEach(t => {
        if (counts[t.status] !== undefined) counts[t.status]++;
      });
      setStats(counts);

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
    <div className="ticket-dashboard-container">
      <nav className="ticket-nav">
        <div className="nav-logo">SLIIT Smart Campus</div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <header className="dashboard-top-header">
          <div className="welcome-section">
            <h1>👋 Welcome back, {user.fullName.split(' ')[0]}</h1>
            <p>Here's a snapshot of your maintenance activities and ticket requests.</p>
          </div>
          <button className="create-new-btn" onClick={() => navigate('/tickets/create')}>
            <PlusCircle size={20} /> Submit New Ticket
          </button>
        </header>

        {/* Stats Section */}
        <section className="dashboard-stats-grid">
          <div className="stat-card st-open">
            <div className="stat-icon"><Clock size={24} /></div>
            <div className="stat-info">
              <h2>{stats.OPEN}</h2>
              <p>Active Requests</p>
            </div>
          </div>
          <div className="stat-card st-progress">
            <div className="stat-icon"><Info size={24} /></div>
            <div className="stat-info">
              <h2>{stats.IN_PROGRESS}</h2>
              <p>In Progress</p>
            </div>
          </div>
          <div className="stat-card st-resolved">
            <div className="stat-icon"><CheckCircle size={24} /></div>
            <div className="stat-info">
              <h2>{stats.RESOLVED}</h2>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card st-rejected">
            <div className="stat-icon"><XCircle size={24} /></div>
            <div className="stat-info">
              <h2>{stats.REJECTED}</h2>
              <p>Rejected</p>
            </div>
          </div>
        </section>

        {/* Tickets Table Section */}
        <section className="activity-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <span className="count-label">{tickets.length} total entries</span>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-wrapper">
                <div className="spinner"></div>
                <p>Retrieving your logs...</p>
              </div>
            ) : errorMsg ? (
              <div className="alert-error">
                <AlertCircle size={20} /> {errorMsg}
              </div>
            ) : tickets.length === 0 ? (
              <div className="empty-state-base">
                <LayoutDashboard size={48} />
                <h3>No Recent Activity</h3>
                <p>Everything looks clear! If you have a maintenance issue, click 'Submit New Ticket' to get started.</p>
              </div>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>REF ID</th>
                    <th>DESCRIPTION</th>
                    <th>CATEGORY</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="id-cell">#{ticket.id}</td>
                      <td className="desc-cell">{ticket.description.substring(0, 40)}{ticket.description.length > 40 ? '...' : ''}</td>
                      <td><span className="cat-text">{ticket.category.replace('_', ' ')}</span></td>
                      <td>
                        <span className={`prio-tag ${ticket.priority.toLowerCase()}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(ticket.createdAt)}</td>
                      <td>
                        <button className="row-action-btn" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                          View Details <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyTickets;
