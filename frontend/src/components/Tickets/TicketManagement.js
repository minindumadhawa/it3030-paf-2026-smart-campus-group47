import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, 
  ChevronRight, LayoutDashboard, LogOut,
  MapPin, Calendar, Search, Filter
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import './TicketManagement.css';

const statusIcons = {
  OPEN: <Clock size={16} />,
  IN_PROGRESS: <Clock size={16} />,
  RESOLVED: <CheckCircle size={16} />,
  REJECTED: <XCircle size={16} />,
  CLOSED: <CheckCircle size={16} />,
};

const TicketManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'ADMIN') {
        navigate('/login');
      } else {
        setUser(parsedUser);
        fetchAllTickets(parsedUser.role);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Apply filters
    let result = tickets;
    
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }
    
    if (searchTerm) {
      result = result.filter(t => 
        t.id.toString().includes(searchTerm) || 
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.userFullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTickets(result);
  }, [searchTerm, statusFilter, tickets]);

  const fetchAllTickets = async (role) => {
    setLoading(true);
    try {
      const data = await ticketService.getAllTickets(role);
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sortedData);
      setFilteredTickets(sortedData);
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

  if (!user) return <div className="ticket-loading">Authenticating Admin...</div>;

  return (
    <div className="admin-mgmt-container">
      <nav className="admin-mgmt-nav">
        <div className="nav-logo">Smart Campus <span>| Incident Management</span></div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/admin-dashboard')}>Main Dashboard</button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            <LogOut size={16} style={{marginRight: '5px'}}/> Logout
          </button>
        </div>
      </nav>

      <main className="mgmt-main">
        <div className="mgmt-header">
          <div>
            <h1>Centralized Ticket Management</h1>
            <p>Overview of all maintenance and incident reports across campus</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, User, or Description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <Filter size={18} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Fetching active records...</div>
        ) : errorMsg ? (
          <div className="alert-error">{errorMsg}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-mgmt">
            <LayoutDashboard size={64} style={{marginBottom: '1.5rem', opacity: 0.1}}/>
            <h3>No records found</h3>
            <p>No tickets match your current search or filter criteria.</p>
          </div>
        ) : (
          <div className="mgmt-table-card">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Reporter</th>
                  <th>Submitted</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td><span className="id-cell">#{ticket.id}</span></td>
                    <td className="category-cell">{ticket.category.replace('_', ' ')}</td>
                    <td className="reporter-cell">
                      <div className="reporter-info">
                        <span className="reporter-name">{ticket.userFullName}</span>
                      </div>
                    </td>
                    <td><span className="date-cell">{formatDate(ticket.createdAt)}</span></td>
                    <td>
                      <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                        {statusIcons[ticket.status]} {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="mgmt-action-btn">
                        Manage <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default TicketManagement;
