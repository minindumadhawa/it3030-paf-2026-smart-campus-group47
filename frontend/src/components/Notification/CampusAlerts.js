import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CampusAlerts.css';

const typeIcons = {
    BOOKING_APPROVED: '✅',
    BOOKING_REJECTED: '❌',
    TICKET_UPDATE: '🔧',
    NEW_COMMENT: '💬',
};

const typeLabels = {
    BOOKING_APPROVED: 'Booking Approved',
    BOOKING_REJECTED: 'Booking Rejected',
    TICKET_UPDATE: 'Ticket Update',
    NEW_COMMENT: 'New Comment',
};

const CampusAlerts = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    useEffect(() => {
        if (!userId) {
            setLoading(false);
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
        } catch (err) {}
    };

    const deleteNotification = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/notifications/${id}`, {
                method: 'DELETE', credentials: 'include'
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {}
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`http://localhost:8080/api/notifications/mark-all-read/${userId}`, {
                method: 'PUT', credentials: 'include'
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {}
    };

    const filteredNotifications = filter === 'ALL'
        ? notifications
        : filter === 'UNREAD'
        ? notifications.filter(n => !n.read)
        : notifications.filter(n => n.type === filter);

    const unreadCount = notifications.filter(n => !n.read).length;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="alerts-container">
            {/* Header */}
            <div className="alerts-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <div className="alerts-title-section">
                    <h1 className="alerts-title">🔔 Campus Alerts</h1>
                    <p className="alerts-subtitle">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button className="mark-all-btn" onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="alerts-filters">
                {['ALL', 'UNREAD', 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'TICKET_UPDATE', 'NEW_COMMENT'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'ALL' ? 'All' :
                         f === 'UNREAD' ? `Unread (${unreadCount})` :
                         typeLabels[f] || f}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="alerts-list">
                {loading ? (
                    <div className="alerts-empty">Loading...</div>
                ) : !userId ? (
                    <div className="alerts-empty">
                        <p>Please login to view your alerts.</p>
                        <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="alerts-empty">
                        <span className="empty-icon">🔕</span>
                        <p>No notifications found.</p>
                    </div>
                ) : (
                    filteredNotifications.map(n => (
                        <div
                            key={n.id}
                            className={`alert-card ${!n.read ? 'unread' : ''}`}
                            onClick={() => !n.read && markAsRead(n.id)}
                        >
                            <div className="alert-icon">
                                {typeIcons[n.type] || '🔔'}
                            </div>
                            <div className="alert-content">
                                <div className="alert-type-badge">{typeLabels[n.type] || n.type}</div>
                                <p className="alert-message">{n.message}</p>
                                <span className="alert-time">{formatDate(n.createdAt)}</span>
                            </div>
                            <div className="alert-actions">
                                {!n.read && (
                                    <button
                                        className="read-btn"
                                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                        title="Mark as read"
                                    >
                                        ✓
                                    </button>
                                )}
                                <button
                                    className="delete-btn"
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CampusAlerts;