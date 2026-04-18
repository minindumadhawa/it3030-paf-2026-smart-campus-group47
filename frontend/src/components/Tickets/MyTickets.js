import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, Clock, CheckCircle, XCircle, 
  AlertCircle, LayoutDashboard, LogOut,
  ChevronRight, Calendar, User, Info, Search, Filter
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import './MyTickets.css';

const MyTickets = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

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

  useEffect(() => {
    let result = [...tickets];
    
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }
    
    if (categoryFilter !== 'ALL') {
      result = result.filter(t => t.category === categoryFilter);
    }

    if (priorityFilter !== 'ALL') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.id.toString().includes(lowerSearch) || 
        t.description.toLowerCase().includes(lowerSearch)
      );
    }
    
    setFilteredTickets(result);
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter, tickets]);

  const fetchMyTickets = async (userId) => {
    setLoading(true);
    try {
      const data = await ticketService.getMyTickets(userId);
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sortedData);
      setFilteredTickets(sortedData);
      
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

  const calculateActiveTime = (createdAt) => {
    if (!createdAt) return '';
    const start = new Date(createdAt);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const days = Math.floor(diffMins / 1440);
    const hours = Math.floor((diffMins % 1440) / 60);
    const mins = diffMins % 60;

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    result += `${mins}m`;
    return result.trim();
  };

  if (!user) return <div className="ticket-loading">Authenticating...</div>;

  return (
    <div className="ticket-dashboard-container">
      <nav className="ticket-nav">
        <div className="nav-logo">SLIIT Smart Campus</div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard')}>Dashboard</button>
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
            <div className="stat-info"><h2>{stats.OPEN}</h2><p>Active Requests</p></div>
          </div>
          <div className="stat-card st-progress">
            <div className="stat-icon"><Info size={24} /></div>
            <div className="stat-info"><h2>{stats.IN_PROGRESS}</h2><p>In Progress</p></div>
          </div>
          <div className="stat-card st-resolved">
            <div className="stat-icon"><CheckCircle size={24} /></div>
            <div className="stat-info"><h2>{stats.RESOLVED}</h2><p>Completed</p></div>
          </div>
          <div className="stat-card st-rejected">
            <div className="stat-icon"><XCircle size={24} /></div>
            <div className="stat-info"><h2>{stats.REJECTED}</h2><p>Rejected</p></div>
          </div>
        </section>

        {/* Tickets Table Section */}
        <section className="activity-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <span className="count-label">{filteredTickets.length} total entries</span>
          </div>

          {/* Advanced Filter Row (Navy Style - as per photo) */}
          <div className="advanced-filters-row">
            <div className="filter-item search">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search by ID or Issue..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-item">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="filter-item">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="ALL">All Categories</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="IT_EQUIPMENT">IT Equipment</option>
                <option value="FURNITURE">Furniture</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="CLEANING">Cleaning</option>
                <option value="FACILITY">Facility</option>
              </select>
            </div>
            <div className="filter-item">
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-wrapper">
                <div className="spinner"></div>
                <p>Retrieving your logs...</p>
              </div>
            ) : errorMsg ? (
              <div className="alert-error"><AlertCircle size={20} /> {errorMsg}</div>
            ) : filteredTickets.length === 0 ? (
              <div className="empty-state-base">
                <LayoutDashboard size={48} />
                <h3>No Recent Activity</h3>
                <p>No tickets match your search filters.</p>
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
                    <th>DURATION</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
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
                        <span style={{ fontSize: '0.8rem', color: ticket.resolutionDuration ? '#16a34a' : '#F37021', fontWeight: '600' }}>
                          {ticket.resolutionDuration || calculateActiveTime(ticket.createdAt)}
                        </span>
                      </td>
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
