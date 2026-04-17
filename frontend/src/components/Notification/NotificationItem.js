import React from 'react';

const NotificationItem = ({ notification, onRead }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED': return '✅';
      case 'BOOKING_REJECTED': return '❌';
      case 'TICKET_UPDATE':    return '🔧';
      case 'NEW_COMMENT':      return '💬';
      default:                 return '🔔';
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div
      onClick={() => !notification.read && onRead(notification.id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
        cursor: notification.read ? 'default' : 'pointer',
        background: notification.read ? 'white' : '#fff5f5',
        borderLeft: notification.read ? 'none' : '3px solid #ef4444',
        transition: 'background 0.12s'
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>
        {getIcon(notification.type)}
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: '#334155', margin: '0 0 4px', lineHeight: 1.5 }}>
          {notification.message}
        </p>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {timeAgo(notification.createdAt)}
        </span>
      </div>
      {/* 🔴 Unread red badge */}
      {!notification.read && (
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: '#ef4444', flexShrink: 0, marginTop: 6
        }} />
      )}
    </div>
  );
};

export default NotificationItem;