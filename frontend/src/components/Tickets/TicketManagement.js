import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  ChevronRight, LayoutDashboard, LogOut,
  MapPin, Calendar, Search, Filter, RefreshCw, ChevronLeft
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

  // Advanced Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

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
        t.description.toLowerCase().includes(lowerSearch) ||
        t.userFullName.toLowerCase().includes(lowerSearch) ||
        (t.locationOrResource && t.locationOrResource.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort
    if (sortBy === 'NEWEST') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'OLDEST') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'PRIORITY') {
      const prioMap = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      result.sort((a, b) => prioMap[a.priority] - prioMap[b.priority]);
    }

    setFilteredTickets(result);
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter, sortBy, tickets]);

  const fetchAllTickets = async (role) => {
    setLoading(true);
    try {
      const data = await ticketService.getAllTickets(role);
      setTickets(data);
      setFilteredTickets(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short'
    });
  };

  if (!user) return <div className="ticket-loading">Authenticating Records...</div>;

  return (
    <div className="admin-mgmt-container">
      <nav className="admin-mgmt-nav">
        <div className="nav-logo">Smart Campus <span>| Admin Portal</span></div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/admin-dashboard')}>Main Dashboard</button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="mgmt-main">
        <div className="mgmt-upper-header">
          <div className="title-area">
            <h1>Maintenance Tickets</h1>
            <p>Track and manage all incident reports from across the campus faculty.</p>
          </div>
          <div className="action-area">
            <button className="refresh-btn" onClick={() => fetchAllTickets(user.role)}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Advanced Filters Row */}
        <div className="advanced-filters-row">
          <div className="filter-item search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search ID, Name, or Issue..."
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

          <div className="filter-item">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="PRIORITY">By Priority</option>
            </select>
          </div>
        </div>

        <div className="mgmt-table-section">
          <div className="table-card">
            {loading ? (
              <div className="loading-wrapper">
                <div className="spinner"></div>
                <p>Syncing active incident reports...</p>
              </div>
            ) : errorMsg ? (
              <div className="alert-error"><AlertCircle size={20} /> {errorMsg}</div>
            ) : filteredTickets.length === 0 ? (
              <div className="empty-state-base">
                <LayoutDashboard size={48} />
                <h3>No records match your filters</h3>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th># ID</th>
                    <th>TITLE / DESCRIPTION</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>REPORTED BY</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="id-col">#{ticket.id}</td>
                      <td className="title-col">
                        <strong>{ticket.category.replace('_', ' ')}</strong>
                        <span>{ticket.description.substring(0, 30)}{ticket.description.length > 30 ? '...' : ''}</span>
                      </td>
                      <td><span className="cat-chip">{ticket.category.replace('_', ' ')}</span></td>
                      <td><span className="loc-text">{ticket.locationOrResource || 'N/A'}</span></td>
                      <td>
                        <span className={`prio-badge ${ticket.priority.toLowerCase()}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`stat-pill pill-${ticket.status.toLowerCase().replace('_', '-')}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="reporter-col">{ticket.userFullName}</td>
                      <td className="date-col">{formatDate(ticket.createdAt)}</td>
                      <td>
                        <button className="manage-row-btn" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer / Pagination UI */}
          <div className="mgmt-footer">
            <span className="showing-text">Showing {filteredTickets.length} of {tickets.length} records</span>
            <div className="pagination-ctrl">
              <button disabled className="page-btn"><ChevronLeft size={16} /> Prev</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">Next <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketManagement;
