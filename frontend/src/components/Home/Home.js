import React from 'react';
import './Home.css';
import { Building2, Wrench, Calendar, Bell, ChevronRight, UserCircle } from 'lucide-react';
import logo from '../../images/SLIIT.png';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <img src={logo} alt="SLIIT Logo" className="navbar-logo" />
          <span className="brand-title">Smart Campus Operations Hub</span>
        </div>
        <div className="nav-links">
          <a href="#services" className="nav-link">Services</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
          <button className="auth-btn" onClick={() => navigate('/login')}>
            <UserCircle size={20} />
            <span>Login</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Empowering Your <span className="highlight">Campus Experience</span>
          </h1>
          <p className="hero-subtitle">
            Seamlessly manage facility bookings, report maintenance issues, and stay updated with your Smart Campus Operations Hub.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">
              Explore Services <ChevronRight size={20} />
            </button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
        <div className="hero-visual">
          {/* Decorative glass elements for the visual side */}
          <div className="glass-card decorative-card card-1">
            <Calendar className="card-icon" size={32} />
            <div className="card-info">
              <h4>Library Room booked</h4>
              <p>Today, 2:00 PM</p>
            </div>
          </div>
          <div className="glass-card decorative-card card-2">
            <Wrench className="card-icon" size={32} />
            <div className="card-info">
              <h4>Maintenance resolved</h4>
              <p>Computing Lab 3</p>
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-header">
          <h2>Our Core Services</h2>
          <p>Streamlined access to essential campus operations</p>
        </div>

        <div className="services-grid">
          {/* Facility Bookings Card */}
          <div className="service-card interactive-card">
            <div className="card-icon-wrapper orange-gradient">
              <Building2 size={32} />
            </div>
            <h3>Facility Bookings</h3>
            <p>Reserve lecture halls, study rooms, and auditoriums with real-time availability and instant confirmations.</p>
            <a href="/bookings" className="card-action">
              Book Now <ChevronRight size={16} />
            </a>
          </div>

          {/* Maintenance Reporting Card */}
          <div className="service-card interactive-card">
            <div className="card-icon-wrapper blue-gradient">
              <Wrench size={32} />
            </div>
            <h3>Maintenance Reporting</h3>
            <p>Report technical faults, plumbing issues, or broken equipment easily. Track the resolution status in real-time.</p>
            <a href="/maintenance" className="card-action">
              Report Issue <ChevronRight size={16} />
            </a>
          </div>

          {/* Campus Alerts Card */}
          <div className="service-card interactive-card">
            <div className="card-icon-wrapper purple-gradient">
              <Bell size={32} />
            </div>
            <h3>Campus Alerts</h3>
            <p>Stay informed with urgent notifications, upcoming events, and important announcements across the campus.</p>
            <a href="/alerts" className="card-action">
              View Alerts <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>SLIIT Smart Campus</h3>
            <p>Innovating the educational ecosystem through smart operations and seamless connectivity.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Quick Links</h4>
              <a href="#services">Services</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/support">Support</a>
            </div>
            <div className="link-group">
              <h4>Contact</h4>
              <p>📍 Malabe, Sri Lanka</p>
              <p>📧 support@sliit.lk</p>
              <p>📞 +94 11 123 4567</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SLIIT Smart Campus Operations Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
