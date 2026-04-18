import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, ArrowRight } from 'lucide-react';
import './UserDashboard.css';
import NotificationBell from '../Notification/NotificationBell';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check URL params from Google OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('userId');
    const urlName = urlParams.get('name');
    const urlEmail = urlParams.get('email');

    if (urlUserId) {
      const oauthUser = {
        id: parseInt(urlUserId),
        fullName: urlName,
        email: urlEmail,
        role: 'USER'
      };
      localStorage.setItem('user', JSON.stringify(oauthUser));
      setUser(oauthUser);
      window.history.replaceState({}, '', '/dashboard');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        setUser(parsedUser);
      }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NotificationBell userId={user?.id} />
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome back, {user.fullName}! 👋</h1>
          <p>Access all your standard Smart Campus operations right here.</p>
          <button
            className="browse-btn"
            style={{ marginTop: '20px', backgroundColor: '#f97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/user/resources')}
          >
            Browse Available Resources
          </button>
          <button
            className="browse-btn"
            style={{ marginTop: '20px', marginLeft: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/user/bookings')}
          >
            Manage My Bookings
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
            <div className="dashboard-btn-group">
              <button
                className="dash-action-btn primary"
                onClick={() => navigate('/tickets/my')}
              >
                <LayoutDashboard size={18} /> My Tickets
              </button>
              <button
                className="dash-action-btn secondary"
                onClick={() => navigate('/tickets/create')}
              >
                <PlusCircle size={18} /> Submit New Ticket
              </button>
            </div>
          </div>

          {/* ✅ UPDATED - Notifications card */}
          <div className="widget-card premium-glass">
            <h3>System Notifications</h3>
            <p className="empty-state">
              <span
                style={{ color: '#f97316', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => navigate('/alerts')}
              >
                View all notifications →
              </span>
            </p>
          </div>
        </section>
      </main>
    </div>
    
  );
};

export default UserDashboard;
