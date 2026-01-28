import React from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_LINKS, Logo } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
    isCollapsed: boolean;
    setCollapsed: (isCollapsed: boolean) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setCollapsed, isMobileOpen, onMobileClose }) => {
    const { user, logout } = useAuth();

    const linkClass = "flex items-center px-4 py-2 md:py-2.5 text-sm md:text-base text-gray-600 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors duration-200 group relative";
    const activeLinkClass = "font-semibold border-l-4 bg-primary-green/10 text-primary-green border-primary-green dark:bg-gradient-to-r dark:from-electric-blue/20 dark:to-transparent dark:text-text-accent dark:border-electric-blue dark:shadow-lg dark:shadow-electric-blue/20 dark:animate-pulse-glow dark:[--tw-shadow-color:theme(colors.electric-blue/50)]";

    const visibleLinks = ADMIN_NAV_LINKS.filter(link => user && link.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        // Force a full page reload after navigating to ensure all state is cleared
        window.location.hash = '/login';
        window.location.reload();
    };

    const sidebarContent = (
        <div className={`flex flex-col h-full bg-white dark:bg-glass-surface/60 dark:backdrop-blur-xl border-r border-gray-300 dark:border-glass-border relative`}>
            <div className={`flex items-center h-20 flex-shrink-0 px-4 ${isCollapsed && 'lg:px-0 lg:justify-center'}`}>
                <div className={`${isCollapsed ? 'lg:hidden' : ''} md:hidden lg:block text-gray-800 dark:text-text-primary`}>
                    <Logo />
                </div>
                <div className={`hidden ${isCollapsed ? 'lg:block' : ''} md:block lg:hidden text-gray-800 dark:text-text-primary`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-neon-cyan"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {visibleLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        end={link.path === '/admin'}
                        className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
                        title={link.name}
                    >
                        {link.icon}
                        <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 md:hidden ${isCollapsed ? 'lg:hidden' : 'lg:inline-block'}`}>{link.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="px-4 py-4">
                <button
                    onClick={handleLogout}
                    className={`${linkClass} w-full`}
                    title="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 md:hidden ${isCollapsed ? 'lg:hidden' : 'lg:inline-block'}`}>Logout</span>
                </button>
            </div>
            {/* Collapse button for desktop */}
            <button
                onClick={() => setCollapsed(!isCollapsed)}
                className="absolute top-6 p-2 rounded-full text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary bg-white dark:bg-glass-surface border border-gray-300 dark:border-glass-border hidden lg:block transition-all duration-300 z-50"
                style={{ right: '-16px' }}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar (Drawer) */}
            <div className="md:hidden">
                {isMobileOpen && <div onClick={onMobileClose} className="fixed inset-0 bg-black/60 z-40" />}
                <div className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {sidebarContent}
                </div>
            </div>

            {/* Static Sidebar for Tablet/Desktop */}
            <div className={`hidden md:flex md:flex-shrink-0 relative z-30 transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} md:w-20`}>
                {sidebarContent}
            </div>
        </>
    );
};

export default Sidebar;