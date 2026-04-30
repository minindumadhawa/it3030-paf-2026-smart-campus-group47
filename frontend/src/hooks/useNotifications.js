import { useCallback } from 'react';

export const useNotifications = (userId) => {
    const getNotifications = useCallback(async () => {
        try {
            const response = await fetch(`/api/notifications/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }, [userId]);

    const getUnreadNotifications = useCallback(async () => {
        try {
            const response = await fetch(`/api/notifications/user/${userId}/unread`);
            if (!response.ok) throw new Error('Failed to fetch unread notifications');
            return await response.json();
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            return [];
        }
    }, [userId]);

    const getUnreadCount = useCallback(async () => {
        try {
            const response = await fetch(`/api/notifications/user/${userId}/unread-count`);
            if (!response.ok) throw new Error('Failed to fetch unread count');
            const data = await response.json();
            return data.unreadCount;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }, [userId]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/mark-as-read`, {
                method: 'PUT'
            });
            if (!response.ok) throw new Error('Failed to mark notification as read');
            return await response.json();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return null;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch(`/api/notifications/user/${userId}/mark-all-as-read`, {
                method: 'PUT'
            });
            if (!response.ok) throw new Error('Failed to mark all as read');
            return await response.json();
        } catch (error) {
            console.error('Error marking all as read:', error);
            return null;
        }
    }, [userId]);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete notification');
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }, []);

    const getNotificationsByType = useCallback(async (type) => {
        try {
            const response = await fetch(`/api/notifications/user/${userId}/type/${type}`);
            if (!response.ok) throw new Error('Failed to fetch notifications by type');
            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications by type:', error);
            return [];
        }
    }, [userId]);

    return {
        getNotifications,
        getUnreadNotifications,
        getUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getNotificationsByType
    };
};
