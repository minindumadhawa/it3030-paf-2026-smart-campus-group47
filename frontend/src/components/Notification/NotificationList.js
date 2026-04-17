import React, { useState, useEffect } from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ userId, onRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false); // ✅ Fix - userId නැත්නම් loading නවත්වනවා
      return;
    }
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${userId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {}
    finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}`, {
        method: 'PUT', credentials: 'include'
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      if (onRead) onRead();
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:8080/api/notifications/mark-all-read/${userId}`, {
        method: 'PUT', credentials: 'include'
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onRead) onRead();
    } catch (err) {}
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No notifications</div>
      ) : (
        notifications.map(n => (
          <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
        ))
      )}
    </div>
  );
};

export default NotificationList;