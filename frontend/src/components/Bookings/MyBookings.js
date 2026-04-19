import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import './Bookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchBookings(parsedUser.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchBookings = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/user/${user.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          showNotification('Booking cancelled successfully.', 'success');
          fetchBookings(user.id);
        } else {
          showNotification('Failed to cancel the booking.', 'error');
        }
      } catch (error) {
        showNotification('An error occurred while canceling.', 'error');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'APPROVED': return 'badge-success';
      case 'PENDING': return 'badge-warning';
      case 'REJECTED': return 'badge-danger';
      case 'CANCELLED': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  if (loading) return <div className="dashboard-loading">Loading bookings...</div>;

  return (
    <div className="bookings-page">
      <main className="bookings-main">
        <div className="header-flex">
          <div className="bookings-title-group">
            <h1>My Bookings</h1>
            <p>Track and manage your resource reservation requests.</p>
          </div>
          <div className="bookings-header-actions">
            <button className="btn-back-dash" onClick={() => navigate('/dashboard')}>← Dashboard</button>
            <button className="btn-book-new" onClick={() => navigate('/user/resources')}>+ Book New Resource</button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bookings-empty-state">
            <div className="empty-icon">📅</div>
            <h3>No Bookings Yet</h3>
            <p>You haven't made any booking requests yet. Browse available resources to get started.</p>
            <button className="btn-book-new" onClick={() => navigate('/user/resources')}>Browse Resources</button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(booking => (
              <div key={booking.id} className={`booking-card bk-status-${booking.status.toLowerCase()}`}>
                <div className="booking-card-header">
                  <div className="bk-resource-info">
                    <h3>{booking.resourceName}</h3>
                    <span className="bk-resource-type">{booking.resourceType.replace('_', ' ')}</span>
                  </div>
                  <span className={`bk-status-badge bk-badge-${booking.status.toLowerCase()}`}>{booking.status}</span>
                </div>

                <div className="bk-divider"></div>

                <div className="booking-details">
                  <div className="bk-detail-row">
                    <span className="bk-detail-icon">📅</span>
                    <span><strong>Date:</strong> {booking.bookingDate}</span>
                  </div>
                  <div className="bk-detail-row">
                    <span className="bk-detail-icon">🕐</span>
                    <span><strong>Time:</strong> {booking.startTime} – {booking.endTime}</span>
                  </div>
                  <div className="bk-detail-row">
                    <span className="bk-detail-icon">📝</span>
                    <span><strong>Purpose:</strong> {booking.purpose}</span>
                  </div>
                  {booking.expectedAttendees && (
                    <div className="bk-detail-row">
                      <span className="bk-detail-icon">👥</span>
                      <span><strong>Attendees:</strong> {booking.expectedAttendees}</span>
                    </div>
                  )}
                </div>

                {booking.status === 'REJECTED' && booking.adminReason && (
                  <div className="bk-rejection-reason">
                    <span className="bk-rejection-icon">⚠️</span>
                    <div>
                      <strong>Rejection Reason:</strong>
                      <p>{booking.adminReason}</p>
                    </div>
                  </div>
                )}

                {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                  <div className="booking-actions-footer">
                    <button className="btn-cancel-booking" onClick={() => handleCancelClick(booking.id)}>
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
