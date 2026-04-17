import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './Bookings.css';

const BookingForm = () => {
  const { resourceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Prefill resource metadata if passed via state
  const resourceParams = location.state?.resource;

  const [formData, setFormData] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const dateObj = new Date(formData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.bookingDate || !formData.startTime || !formData.endTime || !formData.purpose) {
        return "Please fill in all required fields.";
    }

    if (dateObj < today) {
        return "Booking date cannot be in the past.";
    }

    if (formData.startTime >= formData.endTime) {
        return "End time must be after the start time.";
    }

    if (formData.expectedAttendees && formData.expectedAttendees <= 0) {
        return "Expected attendees must be a positive number.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      const payload = {
        resourceId: resourceId,
        userId: user.id,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null
      };

      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(true);
        window.alert("Booking requested successfully! Your request has been sent for admin approval.");
        navigate('/user/bookings');
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to create booking. Time slot might be unavailable.');
      }
    } catch (err) {
      setError('A network error occurred.');
    }
  };

  if (!user) return null;

  return (
    <div className="booking-container">
      <div className="booking-card premium-glass">
        <div className="booking-form-inner">
          <h2>Request a Booking</h2>
          {resourceParams && (
              <p className="resource-context">
                  Booking for: <strong>{resourceParams.name}</strong>
                  <span className="badge">{resourceParams.type}</span>
              </p>
          )}

          {error && <div className="error-alert">{error}</div>}
          {success && <div className="success-alert">Booking requested successfully! Redirecting...</div>}

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                required
                className="premium-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="premium-input"
                />
              </div>
              <div className="form-group half">
                <label>End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="premium-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Purpose *</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Project Meeting, Revision Session"
                required
                className="premium-input"
              />
            </div>

            <div className="form-group">
              <label>Expected Attendees</label>
              <input
                type="number"
                name="expectedAttendees"
                value={formData.expectedAttendees}
                onChange={handleChange}
                min="1"
                placeholder="Optional"
                className="premium-input"
              />
            </div>

            <div className="booking-actions">
               <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Go Back</button>
               <button type="submit" className="submit-btn">Submit Request</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
