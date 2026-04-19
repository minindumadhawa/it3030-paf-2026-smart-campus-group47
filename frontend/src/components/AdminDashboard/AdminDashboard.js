import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Layout, Activity, FileText, 
  UserCheck, Box, LogOut, ArrowRight, 
  Settings, Users, Briefcase
} from 'lucide-react';
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

  if (!admin) return <div className="admin-loading">Authenticating Admin Portal</div>;

  return (
    <div className="admin-dashboard-container">
      <nav className="admin-dashboard-nav">
        <div className="nav-logo">SLIIT Smart Campus <span>| Admin Control</span></div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </nav>
      
      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <h1>
            <Shield className="icon-orange" size={40} /> 
            Admin Portal: Welcome, {admin.fullName}!
          </h1>
          <p>System Management and Global Campus Settings.</p>
          
          <div className="quick-actions-container">
            <button className="admin-primary-btn" onClick={() => navigate('/admin/resources')}>
              <Box size={20} /> Manage Facilities & Resources
            </button>
            <button className="admin-primary-btn" onClick={() => navigate('/admin/bookings')}>
              <Briefcase size={20} /> Review Booking Requests
            </button>
          </div>
        </header>

        <section className="admin-dashboard-widgets">
          <div className="admin-premium-card">
            <h3><Activity className="icon-orange" size={20} /> System Status</h3>
            <p><strong>Environment:</strong> Production</p>
            <p><strong>Active Users:</strong> 1,245</p>
            <span className="status-badge green-badge">All Systems Operational</span>
          </div>
          
          <div className="admin-premium-card">
            <h3><Users className="icon-orange" size={20} /> Recent Registrations</h3>
            <div className="empty-state">No anomalous user activities detected.</div>
          </div>

          <div className="admin-premium-card" 
               style={{cursor: 'pointer'}}
               onClick={() => navigate('/admin/tickets')}>
            <h3><FileText className="icon-orange" size={20} /> Maintenance & Incidents</h3>
            <p><strong>Pending Actions:</strong> Manage student reports and campus maintenance logs.</p>
            <span className="status-badge orange-badge">
              Open Records Portal <ArrowRight size={14} style={{marginLeft: '5px'}}/>
            </span>
          </div>

          <div className="admin-premium-card">
            <h3><UserCheck className="icon-orange" size={20} /> Administrator Details</h3>
            <p><strong>Name:</strong> {admin.fullName}</p>
            <p><strong>Security Clearance:</strong> Level 5</p>
            <p><strong>System Access:</strong> Full Control</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
