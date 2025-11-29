import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (id: string, link?: string) => {
        await markAsRead(id);
        setIsOpen(false);
        // Navigation is handled by Link or parent
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary transition-colors relative"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 backdrop-blur-lg rounded-xl shadow-2xl py-1 z-[100] ring-1 ring-black/5 dark:ring-glass-border overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-text-primary">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-accent-blue hover:text-blue-600 font-medium transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-text-muted text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-accent-blue' : 'bg-transparent'}`} />
                                        <div className="flex-1 min-w-0">
                                            {notification.link ? (
                                                <Link
                                                    to={notification.link}
                                                    onClick={() => handleNotificationClick(notification.id)}
                                                    className="text-sm text-gray-800 dark:text-text-primary hover:text-accent-blue dark:hover:text-accent-blue block font-medium"
                                                >
                                                    {notification.message}
                                                </Link>
                                            ) : (
                                                <p className="text-sm text-gray-800 dark:text-text-primary font-medium">
                                                    {notification.message}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 dark:text-text-muted mt-1">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-2 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-center">
                        <Link to="/admin/notifications" className="text-xs text-gray-500 hover:text-gray-900 dark:text-text-muted dark:hover:text-text-primary transition-colors">
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
