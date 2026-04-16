import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'ADMIN') {
        navigate('/login');
      } else {
        setAdmin(parsedUser);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!admin) return <div className="admin-loading">Authenticating Admin...</div>;

  return (
    <div className="admin-dashboard-container">
      <nav className="admin-dashboard-nav">
        <div className="nav-logo">Smart Campus <span>| Admin Control</span></div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>
      
      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <h1>Admin Portal: Welcome, {admin.fullName}! 🛡️</h1>
          <p>System Management and Global Campus Settings.</p>
        </header>

        <section className="admin-dashboard-widgets">
          <div className="admin-widget-card premium-glass-admin">
            <h3>System Status</h3>
            <p><strong>Environment:</strong> Production</p>
            <p><strong>Active Users:</strong> 1,245</p>
            <span className="status-badge green-badge">All Systems Operational</span>
          </div>
          
          <div className="admin-widget-card premium-glass-admin">
            <h3>Recent User Registrations</h3>
            <p className="empty-state">No anomalous user activities detected.</p>
          </div>

          <div className="admin-widget-card premium-glass-admin">
            <h3>Administrator Details</h3>
            <p><strong>Name:</strong> {admin.fullName}</p>
            <p><strong>Security Clearance:</strong> Level 5</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
