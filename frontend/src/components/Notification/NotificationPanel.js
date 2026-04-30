import React, { useState, useEffect } from 'react';
import './NotificationPanel.css';

const NotificationPanel = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            fetchUnreadCount();
            const interval = setInterval(() => {
                fetchNotifications();
                fetchUnreadCount();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`/api/notifications/user/${userId}`);
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(`/api/notifications/user/${userId}/unread-count`);
            const data = await response.json();
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/mark-as-read`, { method: 'PUT' });
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`/api/notifications/user/${userId}/mark-all-as-read`, { method: 'PUT' });
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'BOOKING_APPROVAL': return '✅';
            case 'BOOKING_REJECTION': return '❌';
            case 'BOOKING_CANCELLATION': return '📅';
            case 'TICKET_STATUS_CHANGE': return '🔧';
            case 'TICKET_ASSIGNED': return '👤';
            case 'TICKET_REJECTION': return '🔧';
            case 'NEW_COMMENT': return '💬';
            case 'TICKET_RESOLVED': return '✨';
            default: return 'ℹ️';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-panel-wrapper">
            <div className="notification-bell">
                <button 
                    className="bell-button"
                    onClick={() => setIsOpen(!isOpen)}
                    title="Notifications"
                >
                    🔔
                    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
            </div>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-link" onClick={markAllAsRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id}
                                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    {!notification.isRead && <span className="unread-dot"></span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;