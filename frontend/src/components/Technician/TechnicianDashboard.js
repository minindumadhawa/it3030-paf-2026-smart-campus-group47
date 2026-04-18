import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Layout, ClipboardList, CheckCircle, 
  MapPin, Clock, ArrowRight, Activity, Search
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import './TechnicianDashboard.css';

const TechnicianDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState({ total: 0, pending: 0, resolved: 0 });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'TECHNICIAN') {
              navigate('/login');
              return;
            }
            setUser(parsedUser);
            fetchAssignedTickets(parsedUser.id);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchAssignedTickets = async (techId) => {
        setLoading(true);
        try {
            const data = await ticketService.getAssignedTickets(techId);
            setTickets(data);
            
            // Calculate summary
            const resolved = data.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
            const inProgress = data.filter(t => t.status === 'IN_PROGRESS').length;
            setSummary({
                total: data.length,
                pending: inProgress,
                resolved: resolved
            });
        } catch (err) {
            setError('Could not load assigned tickets.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div className="tech-loading">Authenticating...</div>;

    return (
        <div className="tech-dashboard-container">
            {/* Sidebar / Nav */}
            <nav className="tech-nav">
                <div className="nav-brand">
                    <Activity size={24} className="icon-orange" />
                    <span>Technician Portal</span>
                </div>
                <div className="user-profile-nav">
                    <div className="user-info-text">
                        <span className="user-name">{user.fullName}</span>
                        <span className="user-role">{user.specialization.replace('_', ' ')} Expert</span>
                    </div>
                    <button className="logout-btn-minimal" onClick={handleLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            <main className="tech-main-content">
                <header className="tech-welcome-section">
                    <h1>Active Assignments</h1>
                    <p>Track and manage your maintenance tasks for the campus.</p>
                </header>

                {/* KPI Summary Cards */}
                <div className="tech-stats-grid">
                    <div className="tech-stat-card">
                        <div className="stat-icon-bg total">
                            <ClipboardList size={22} />
                        </div>
                        <div className="stat-info">
                            <h3>{summary.total}</h3>
                            <p>Total Tasks</p>
                        </div>
                    </div>
                    <div className="tech-stat-card">
                        <div className="stat-icon-bg pending">
                            <Activity size={22} />
                        </div>
                        <div className="stat-info">
                            <h3>{summary.pending}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                    <div className="tech-stat-card">
                        <div className="stat-icon-bg completed">
                            <CheckCircle size={22} />
                        </div>
                        <div className="stat-info">
                            <h3>{summary.resolved}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                </div>

                {/* Tickets Section */}
                <div className="tech-tickets-section">
                    <div className="section-header">
                        <h2>Assigned Tickets</h2>
                        <button className="refresh-btn-small" onClick={() => fetchAssignedTickets(user.id)}>Refresh</button>
                    </div>

                    {loading ? (
                        <div className="tech-loader">Loading your tasks...</div>
                    ) : tickets.length === 0 ? (
                        <div className="empty-tech-state">
                            <ClipboardList size={48} />
                            <p>No tickets currently assigned to you.</p>
                        </div>
                    ) : (
                        <div className="tech-ticket-grid">
                            {tickets.map(ticket => (
                                <div key={ticket.id} className={`tech-ticket-card status-${ticket.status.toLowerCase()}`}>
                                    <div className="ticket-card-header">
                                        <span className={`prio-pill ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                                        <span className="ticket-id">#{ticket.id}</span>
                                    </div>
                                    <h3 className="ticket-cat">{ticket.category.replace('_', ' ')}</h3>
                                    <p className="ticket-desc-snippet">{ticket.description.substring(0, 100)}...</p>
                                    
                                    <div className="ticket-meta-footer">
                                        <div className="meta-item">
                                            <MapPin size={14} />
                                            <span>{ticket.locationOrResource || 'Campus Area'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Clock size={14} />
                                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <button 
                                        className="view-details-action"
                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    >
                                        Manage Task <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TechnicianDashboard;
