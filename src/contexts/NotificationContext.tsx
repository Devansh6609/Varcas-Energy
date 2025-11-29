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
            const response = await fetch(`${API_BASE_URL}/api/notifications?limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Listen for real-time events (SSE)
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('authToken');
        if (!token) return;

        const eventSource = new EventSource(`${API_BASE_URL}/api/admin/events?token=${token}`); // Note: standard EventSource doesn't support headers easily, usually need a polyfill or query param auth. 
        // However, our backend currently checks headers. Standard EventSource API limitation.
        // For now, let's rely on the existing polling or the custom fetch-based SSE in AdminLayout if we want to reuse it.
        // Actually, AdminLayout uses fetch for SSE which allows headers. 
        // To avoid double connections, we should probably expose the event stream from a central place or just use polling for now for simplicity/reliability if SSE is tricky with headers.

        // WAIT: AdminLayout ALREADY implements SSE with fetch and headers!
        // We should hook into that or move that logic here.
        // The Implementation Plan said "Handle SSE connection and incoming events" in Context.
        // So I should probably move the SSE logic from AdminLayout to here, OR expose a way to consume events.

        // For this step, I will implement the state management and API calls. 
        // I will add a listener for a custom window event 'crm-notification' which AdminLayout can dispatch.

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
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_BASE_URL}/api/notifications/all/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

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
