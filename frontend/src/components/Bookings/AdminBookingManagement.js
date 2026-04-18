import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import './Bookings.css';

const AdminBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminAction, setAdminAction] = useState(null); // 'APPROVED' or 'REJECTED'
  const [adminReason, setAdminReason] = useState('');
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'ADMIN') {
        navigate('/login');
      } else {
        fetchBookings();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings`);
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

  const openActionModal = (booking, action) => {
    setSelectedBooking(booking);
    setAdminAction(action);
    setAdminReason('');
    setModalOpen(true);
  };

  const submitAction = async () => {
    if (adminAction === 'REJECTED' && !adminReason.trim()) {
      showNotification("A reason is required when rejecting a booking.", "warning");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${selectedBooking.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: adminAction,
          adminReason: adminReason
        })
      });

      if (response.ok) {
        showNotification(`Booking ${adminAction.toLowerCase()} successfully.`, "success");
        setModalOpen(false);
        fetchBookings();
      } else {
        const errData = await response.json();
        showNotification(errData.error || 'Failed to update status.', "error");
      }
    } catch (error) {
      showNotification('An error occurred.', "error");
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'ALL' ? true : b.status === filter);

  if (loading) return <div className="admin-loading">Loading bookings...</div>;

  return (
    <div className="admin-dashboard-container">
      <nav className="admin-dashboard-nav">
        <div className="nav-logo" onClick={() => navigate('/admin-dashboard')} style={{cursor: 'pointer'}}>
          Smart Campus <span>| Admin Portal</span>
        </div>
        <button className="logout-btn" onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</button>
      </nav>

      <main className="admin-dashboard-main bookings-admin-main">
        <header className="admin-dashboard-header">
          <h2>Manage Booking Requests</h2>
          <div className="filter-controls">
            <span className="filter-label">Filter Status:</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </header>

        <section className="bookings-table-container premium-glass-admin">
          {filteredBookings.length === 0 ? (
            <p className="empty-state">No bookings found for the selected filter.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.userName}</td>
                    <td>{b.resourceName} ({b.resourceType})</td>
                    <td>{b.bookingDate} | {b.startTime} - {b.endTime}</td>
                    <td>
                      <span className={`status-badge admin-badge-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'PENDING' && (
                        <div className="action-buttons">
                          <button className="approve-s-btn" onClick={() => openActionModal(b, 'APPROVED')}>Approve</button>
                          <button className="reject-s-btn" onClick={() => openActionModal(b, 'REJECTED')}>Reject</button>
                        </div>
                      )}
                      {b.status !== 'PENDING' && (
                          <span className="action-completed-text">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content premium-glass-admin">
            <h3>{adminAction === 'APPROVED' ? 'Approve Booking' : 'Reject Booking'}</h3>
            <p>Booking ID: #{selectedBooking?.id}</p>
            <p>Reason {adminAction === 'REJECTED' ? '(Required)' : '(Optional)'}:</p>
            <textarea 
              value={adminReason} 
              onChange={(e) => setAdminReason(e.target.value)} 
              placeholder="Enter your comments or reason..."
            ></textarea>
            <div className="modal-actions">
              <button onClick={() => setModalOpen(false)} className="cancel-s-btn">Cancel</button>
              <button onClick={submitAction} className={`confirm-${adminAction.toLowerCase()}-btn`}>
                Confirm {adminAction === 'APPROVED' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManagement;
