import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Layout, Activity, FileText, 
  UserCheck, Box, LogOut, ArrowRight, 
  Settings, Users, Briefcase, Trophy, AlertTriangle
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [analytics, setAnalytics] = useState({
    topResource: 'Loading...',
    outOfServiceCount: 0
  });

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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [resourcesRes, bookingsRes] = await Promise.all([
          fetch('http://localhost:8080/api/resources'),
          fetch('http://localhost:8080/api/bookings')
        ]);
        if (resourcesRes.ok && bookingsRes.ok) {
          const resources = await resourcesRes.json();
          const bookings = await bookingsRes.json();

          const outOfService = resources.filter(r => r.status === 'OUT_OF_SERVICE').length;
          
          let topResourceName = 'None';
          if (bookings.length > 0) {
            const counts = {};
            bookings.forEach(b => {
              if (b.resourceName) {
                counts[b.resourceName] = (counts[b.resourceName] || 0) + 1;
              }
            });
            if (Object.keys(counts).length > 0) {
              topResourceName = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            }
          }

          setAnalytics({
            topResource: topResourceName,
            outOfServiceCount: outOfService
          });
        }
      } catch (error) {
         console.error('Error fetching analytics:', error);
         setAnalytics({
           topResource: 'Error',
           outOfServiceCount: 'Error'
         });
      }
    };
    
    if (admin) {
       fetchAnalytics();
    }
  }, [admin]);

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
            <h3><Trophy className="icon-orange" size={20} /> Top Used Resource</h3>
            <p><strong>Resource Name:</strong> {analytics.topResource}</p>
            <p><strong>Metric:</strong> Highest booking frequency</p>
            <span className="status-badge green-badge">Analytics Generated</span>
          </div>

          <div className="admin-premium-card">
            <h3><AlertTriangle className="icon-orange" size={20} /> Currently Unavailable</h3>
            <p><strong>Broken / Maintenance:</strong> {analytics.outOfServiceCount} items</p>
            <p><strong>Action:</strong> Requires technician review</p>
            {analytics.outOfServiceCount > 0 ? (
                <span className="status-badge orange-badge">Attention Needed</span>
            ) : (
                <span className="status-badge green-badge">All Systems Nominal</span>
            )}
          </div>

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
