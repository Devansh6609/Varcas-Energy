import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

export interface Notification {
    id: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Backend returns a plain array of notifications
                const notifs = Array.isArray(data) ? data : (data.notifications || []);
                setNotifications(notifs);
                setUnreadCount(notifs.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        // Poll notifications every 60 seconds
        const intervalId = setInterval(fetchNotifications, 60000);
        return () => clearInterval(intervalId);
    }, [fetchNotifications]);

    // Listen for custom events dispatched from AdminLayout
    useEffect(() => {
        if (!user) return;

        const handleNotificationEvent = (event: CustomEvent) => {
            const newNotification = event.detail;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        window.addEventListener('crm-notification' as any, handleNotificationEvent);

        return () => {
            window.removeEventListener('crm-notification' as any, handleNotificationEvent);
        };
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        // Mark all locally since we don't have a bulk endpoint
        try {
            const token = localStorage.getItem('authToken');
            const unread = notifications.filter(n => !n.isRead);
            for (const n of unread) {
                await fetch(`${API_BASE_URL}/api/notifications/${n.id}/read`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => {});
            }
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
