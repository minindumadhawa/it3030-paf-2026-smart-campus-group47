import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTicket.css';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: '',
    locationOrResource: '',
    preferredContactDetails: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Basic validation
    if (!formData.category) { setErrorMsg('Please select a category.'); return; }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setErrorMsg('Description must be at least 10 characters.');
      return;
    }
    if (!formData.priority) { setErrorMsg('Please select a priority.'); return; }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          category: formData.category,
          description: formData.description.trim(),
          priority: formData.priority,
          locationOrResource: formData.locationOrResource,
          preferredContactDetails: formData.preferredContactDetails,
        }),
      });

      if (response.ok) {
        setSuccessMsg('Ticket submitted successfully! Redirecting...');
        setTimeout(() => navigate('/tickets/my'), 1500);
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Failed to submit ticket. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Server error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="ticket-loading">Authenticating...</div>;

  return (
    <div className="ticket-page-container">
      <nav className="ticket-nav">
        <div className="nav-logo">Smart Campus Hub</div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link-btn" onClick={() => navigate('/tickets/my')}>My Tickets</button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>Logout</button>
        </div>
      </nav>

      <main className="ticket-main">
        <div className="ticket-form-card">
          <div className="form-header">
            <h1>Submit a Ticket</h1>
            <p>Report an issue or maintenance request on campus</p>
          </div>

          {successMsg && <div className="alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group">
              <label htmlFor="category">Category <span className="required">*</span></label>
              <select id="category" name="category" value={formData.category} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="CLEANING">Cleaning</option>
                <option value="FACILITY">Facility</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority <span className="required">*</span></label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                <option value="">-- Select Priority --</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description <span className="required">*</span></label>
              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Describe the issue in detail (at least 10 characters)..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="locationOrResource">Location / Resource <span className="optional">(optional)</span></label>
              <input
                type="text"
                id="locationOrResource"
                name="locationOrResource"
                placeholder="e.g. Room 201, Lab 3, Block B"
                value={formData.locationOrResource}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredContactDetails">Preferred Contact <span className="optional">(optional)</span></label>
              <input
                type="text"
                id="preferredContactDetails"
                name="preferredContactDetails"
                placeholder="e.g. 0771234567 or your email"
                value={formData.preferredContactDetails}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate('/tickets/my')}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateTicket;
