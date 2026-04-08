import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import Toast from '../../components/admin/Toast';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const UserDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth();
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                <img className="h-9 w-9 rounded-full object-cover" src="https://picsum.photos/100/100?random=40" alt="Admin user avatar" />
                <div className="text-left hidden md:block">
                    <div className="font-medium text-sm text-gray-800">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <Link to="/admin/profile" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};


const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const { triggerUpdate } = useCrmUpdates();
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Lightweight polling for events — NO infinite retry loop
    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        const pollEvents = async () => {
            if (!isMounted) return;
            
            const token = localStorage.getItem('authToken');
            if (!token) return; // Don't poll if not authenticated
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/events`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const event = await response.json();
                    if (event.type === 'NEW_LEAD') {
                        setToastMessage(`New lead received: ${event.data?.name || 'N/A'}`);
                        triggerUpdate();
                    } else if (event.type === 'LEAD_UPDATE') {
                        setToastMessage(`Lead updated: ${event.data?.name || 'N/A'}`);
                        triggerUpdate();
                    }
                }
            } catch (e) {
                // Silently ignore — don't flood console, don't retry aggressively
            }

            // Poll every 30 seconds instead of aggressive retry
            if (isMounted) {
                timeoutId = setTimeout(pollEvents, 30000);
            }
        };

        // Start polling after a brief delay
        timeoutId = setTimeout(pollEvents, 5000);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [triggerUpdate]);

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} isMobileOpen={false} onMobileClose={() => {}} />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-800">Varcas Energy CRM</h1>
                    </div>
                    <UserDropdown />
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-auto bg-gray-50 p-6">
                    <div key={location.pathname} className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
            {toastMessage && <Toast message={toastMessage} type="info" onDismiss={() => setToastMessage(null)} />}
        </div>
    );
};

export default AdminLayout;
