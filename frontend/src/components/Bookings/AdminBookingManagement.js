import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Box, 
  Clock, CheckCircle, XCircle, Briefcase, 
  ArrowRight, Info, Shield, LogOut, Check
} from 'lucide-react';
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

  if (loading) return <div className="admin-loading">Loading Booking Records</div>;

  return (
    <div className="admin-dashboard-container">
      <nav className="admin-dashboard-nav">
        <div className="nav-logo" onClick={() => navigate('/admin-dashboard')} style={{cursor: 'pointer'}}>
          SLIIT Smart Campus <span>| Admin Portal</span>
        </div>
        <button className="back-btn" onClick={() => navigate('/admin-dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </nav>

      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <h1>
            <Briefcase className="icon-orange" size={32} style={{marginRight: '12px', verticalAlign: 'middle'}}/>
            Manage Booking Requests
          </h1>
          <p>Review and process facility booking requests from students and staff.</p>
          
          <div className="filter-controls" style={{marginTop: '20px'}}>
             <span style={{fontSize: '14px', fontWeight: '700', color: '#64748b', marginRight: '10px'}}>FILTER STATUS:</span>
             <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
               <option value="ALL">All Statuses</option>
               <option value="PENDING">Pending</option>
               <option value="APPROVED">Approved</option>
               <option value="REJECTED">Rejected</option>
               <option value="CANCELLED">Cancelled</option>
             </select>
          </div>
        </header>

        <section className="admin-premium-card" style={{padding: '0', overflow: 'hidden'}}>
          {filteredBookings.length === 0 ? (
            <div style={{padding: '50px', textAlign: 'center'}}>
               <p className="empty-state">No bookings found for the selected criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Requester</th>
                    <th>Resource</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b.id}>
                      <td style={{fontWeight: '700', color: '#F37021'}}>#{b.id}</td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                           <User size={14} color="#64748b" /> {b.userName}
                        </div>
                      </td>
                      <td>
                        <strong>{b.resourceName}</strong> 
                        <span style={{fontSize: '11px', color: '#94a3b8', display: 'block'}}>{b.resourceType.replace('_', ' ')}</span>
                      </td>
                      <td>
                        <div style={{fontSize: '13px'}}>
                           <Calendar size={13} style={{marginRight: '5px'}} color="#64748b"/> {b.bookingDate}
                        </div>
                        <div style={{fontSize: '12px', color: '#64748b', marginTop: '3px'}}>
                           <Clock size={12} style={{marginRight: '5px'}}/> {b.startTime} - {b.endTime}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge admin-badge-${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        {b.status === 'PENDING' && (
                          <div className="action-buttons" style={{justifyContent: 'flex-end'}}>
                            <button className="approve-s-btn" onClick={() => openActionModal(b, 'APPROVED')} title="Approve Request">
                               <Check size={14} style={{marginRight: '5px'}}/> Approve
                            </button>
                            <button className="reject-s-btn" onClick={() => openActionModal(b, 'REJECTED')} title="Reject Request">
                               <XCircle size={14} style={{marginRight: '5px'}}/> Reject
                            </button>
                          </div>
                        )}
                        {b.status !== 'PENDING' && (
                            <span style={{fontSize: '12px', color: '#94a3b8', fontStyle: 'italic'}}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{adminAction === 'APPROVED' ? <CheckCircle color="#10b981" /> : <XCircle color="#ef4444" />} {adminAction === 'APPROVED' ? 'Approve Booking' : 'Reject Booking'}</h3>
            <p style={{marginTop: '10px'}}>Processing Reference: <strong>#{selectedBooking?.id}</strong></p>
            
            <div style={{marginTop: '20px'}}>
              <label style={{fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px'}}>ADMIN COMMENTS {adminAction === 'REJECTED' ? '(REQUIRED)' : '(OPTIONAL)'}:</label>
              <textarea 
                value={adminReason} 
                onChange={(e) => setAdminReason(e.target.value)} 
                placeholder="Add notes for the requester..."
                style={{width: '100%', minHeight: '100px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'inherit'}}
              ></textarea>
            </div>
            
            <div className="modal-actions" style={{marginTop: '25px'}}>
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
