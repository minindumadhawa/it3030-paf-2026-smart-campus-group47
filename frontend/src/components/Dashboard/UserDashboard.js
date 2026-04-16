import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="dashboard-loading">Authenticating...</div>;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">Smart Campus Hub</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome back, {user.fullName}! 👋</h1>
          <p>Access all your standard Smart Campus operations right here.</p>
          <button 
            className="browse-btn"
            style={{marginTop: '20px', backgroundColor: '#f97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
            onClick={() => navigate('/user/resources')}
          >
            Browse Available Resources
          </button>
        </header>

        <section className="dashboard-widgets">
          <div className="widget-card premium-glass">
            <h3>Profile Summary</h3>
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email Address:</strong> {user.email}</p>
            <span className="status-badge">Active User</span>
          </div>
          
          <div className="widget-card premium-glass">
            <h3>Upcoming Operations</h3>
            <p className="empty-state">No scheduled operations available.</p>
          </div>

          <div className="widget-card premium-glass">
            <h3>Maintenance & Incident</h3>
            <p>Report issues or request maintenance services on campus.</p>
            <button 
              className="browse-btn"
              style={{marginTop: '15px', backgroundColor: '#f97316', width: '100%'}}
              onClick={() => navigate('/tickets/my')}
            >
              My Tickets
            </button>
            <button 
              className="browse-btn"
              style={{marginTop: '10px', backgroundColor: 'transparent', border: '1px solid #f97316', color: '#f97316', width: '100%'}}
              onClick={() => navigate('/tickets/create')}
            >
              + Submit New Ticket
            </button>
          </div>

          <div className="widget-card premium-glass">
            <h3>System Notifications</h3>
            <p className="empty-state">Inbox is empty. Stay tuned!</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
