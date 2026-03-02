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

    const linkClass = "flex items-center px-4 py-3 text-sm font-medium text-text-secondary hover:text-white hover:bg-white/[0.02] rounded-xl transition-all duration-300 group relative mx-2";
    const activeLinkClass = "font-black bg-gradient-to-r from-neon-cyan/20 to-transparent text-neon-cyan before:absolute before:left-0 before:top-1/4 before:bottom-1/4 before:w-1 before:bg-neon-cyan before:rounded-r-full before:shadow-[0_0_10px_theme(colors.neon-cyan)] shadow-[inset_1px_0_10px_theme(colors.neon-cyan/10)]";

    const visibleLinks = ADMIN_NAV_LINKS.filter(link => user && link.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        // Force a full page reload after navigating to ensure all state is cleared
        window.location.hash = '/login';
        window.location.reload();
    };

    const sidebarContent = (
        <div className={`flex flex-col h-full bg-glass-surface/40 backdrop-blur-3xl border-r border-glass-border/20 relative`}>
            <div className={`flex items-center h-20 flex-shrink-0 px-4 ${isCollapsed && 'lg:px-0 lg:justify-center'}`}>
                <div className={`${isCollapsed ? 'lg:hidden' : ''} md:hidden lg:block text-gray-800 dark:text-text-primary`}>
                    <Logo />
                </div>
                <div className={`hidden ${isCollapsed ? 'lg:block' : ''} md:block lg:hidden text-text-primary`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-neon-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
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
            <div className="px-2 py-4 border-t border-glass-border/10">
                <button
                    onClick={handleLogout}
                    className={`${linkClass} w-full text-error-red hover:text-error-red hover:bg-error-red/10`}
                    title="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 md:hidden ${isCollapsed ? 'lg:hidden' : 'lg:inline-block'}`}>Logout</span>
                </button>
            </div>
            {/* Collapse button for desktop */}
            <button
                onClick={() => setCollapsed(!isCollapsed)}
                className="absolute top-6 p-2 rounded-full text-text-secondary hover:text-neon-cyan bg-glass-surface/80 border border-glass-border/30 hidden lg:flex items-center justify-center transition-all duration-300 z-50 hover:shadow-glow-sm hover:shadow-neon-cyan/20 backdrop-blur-md"
                style={{ right: '-16px', width: '32px', height: '32px' }}
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