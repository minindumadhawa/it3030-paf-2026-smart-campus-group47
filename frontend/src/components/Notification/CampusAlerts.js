import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CampusAlerts.css';

const CampusAlerts = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchNotifications(parsedUser.id);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchNotifications = async (userId) => {
        try {
            const response = await fetch(`/api/notifications/user/${userId}`);
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/mark-as-read`, {
                method: 'PUT'
            });
            if (user) fetchNotifications(user.id);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`/api/notifications/user/${user.id}/mark-all-as-read`, {
                method: 'PUT'
            });
            fetchNotifications(user.id);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });
            if (user) fetchNotifications(user.id);
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const getCategoryBadge = (type) => {
        switch (type) {
            case 'BOOKING_APPROVAL': return 'BOOKING APPROVED';
            case 'BOOKING_REJECTION': return 'BOOKING REJECTED';
            case 'BOOKING_CANCELLATION': return 'BOOKING CANCELLED';
            case 'TICKET_STATUS_CHANGE': return 'TICKET UPDATE';
            case 'TICKET_ASSIGNED': return 'TICKET UPDATE';
            case 'TICKET_REJECTION': return 'TICKET UPDATE';
            case 'TICKET_RESOLVED': return 'TICKET UPDATE';
            case 'NEW_COMMENT': return 'NEW COMMENT';
            default: return 'INFO';
        }
    };

    const getCategoryIcon = (type) => {
        if (type === 'BOOKING_APPROVAL') return '✅';
        if (type === 'BOOKING_REJECTION') return '❌';
        if (type === 'BOOKING_CANCELLATION') return '📅';
        if (type === 'NEW_COMMENT') return '💬';
        if (type && type.includes('TICKET')) return '🔧';
        return 'ℹ️';
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const time = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${month} ${day}, ${time}`;
    };

    const getFilteredNotifications = () => {
        if (filter === 'all') return notifications;
        if (filter === 'unread') return notifications.filter(n => !n.isRead);
        if (filter === 'booking-approved') return notifications.filter(n => n.type === 'BOOKING_APPROVAL');
        if (filter === 'booking-rejected') return notifications.filter(n => n.type === 'BOOKING_REJECTION');
        if (filter === 'ticket-update') return notifications.filter(n => n.type && n.type.includes('TICKET'));
        if (filter === 'new-comment') return notifications.filter(n => n.type === 'NEW_COMMENT');
        return notifications;
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filteredNotifications = getFilteredNotifications();

    return (
        <div className="campus-alerts-page">
            <div className="alerts-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <div className="alerts-title-section">
                    <h1>🔔 Campus Alerts</h1>
                    <p>{unreadCount} unread notifications</p>
                </div>
                <button className="mark-all-read-btn" onClick={markAllAsRead}>
                    Mark all as read
                </button>
            </div>

            <div className="alerts-filters">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button 
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </button>
                <button 
                    className={`filter-btn ${filter === 'booking-approved' ? 'active' : ''}`}
                    onClick={() => setFilter('booking-approved')}
                >
                    Booking Approved
                </button>
                <button 
                    className={`filter-btn ${filter === 'booking-rejected' ? 'active' : ''}`}
                    onClick={() => setFilter('booking-rejected')}
                >
                    Booking Rejected
                </button>
                <button 
                    className={`filter-btn ${filter === 'ticket-update' ? 'active' : ''}`}
                    onClick={() => setFilter('ticket-update')}
                >
                    Ticket Update
                </button>
                <button 
                    className={`filter-btn ${filter === 'new-comment' ? 'active' : ''}`}
                    onClick={() => setFilter('new-comment')}
                >
                    New Comment
                </button>
            </div>

            <div className="alerts-list">
                {filteredNotifications.length === 0 ? (
                    <div className="no-alerts">
                        <p>No notifications to show</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div 
                            key={notification.id}
                            className={`alert-card ${notification.isRead ? 'read' : 'unread'}`}
                        >
                            <div className="alert-icon">
                                {getCategoryIcon(notification.type)}
                            </div>
                            <div className="alert-content">
                                <span className="category-badge">
                                    {getCategoryBadge(notification.type)}
                                </span>
                                <p className="alert-message">{notification.message}</p>
                                <span className="alert-time">
                                    {formatDateTime(notification.createdAt)}
                                </span>
                            </div>
                            <div className="alert-actions">
                                {!notification.isRead && (
                                    <button 
                                        className="action-btn read-btn"
                                        onClick={() => markAsRead(notification.id)}
                                        title="Mark as read"
                                    >
                                        ✓
                                    </button>
                                )}
                                <button 
                                    className="action-btn delete-btn"
                                    onClick={() => deleteNotification(notification.id)}
                                    title="Delete"
                                >
                                    🗑
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