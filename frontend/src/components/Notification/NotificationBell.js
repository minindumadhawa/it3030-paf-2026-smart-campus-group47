import React, { useState, useEffect, useRef } from 'react';
import NotificationList from './NotificationList';

const NotificationBell = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showList, setShowList] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/unread-count/${userId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const count = await res.json();
        setUnreadCount(count);
      }
    } catch (err) {}
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowList(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
      <button
        onClick={() => setShowList(!showList)}
        style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '8px', width: '38px', height: '38px',
          fontSize: '18px', cursor: 'pointer', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: '#ef4444', color: 'white', fontSize: '10px',
            fontWeight: 700, minWidth: '18px', height: '18px',
            borderRadius: '9px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 4px', border: '2px solid white'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showList && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: '340px', background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 1000, maxHeight: '400px', overflowY: 'auto'
        }}>
          <NotificationList userId={userId} onRead={fetchUnreadCount} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;