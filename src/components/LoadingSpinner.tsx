import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    return (
        <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`} role="status" aria-label="Loading">
            {/* Outer Orbit Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/40 border-t-neon-cyan animate-spin"></div>

            {/* Inner Orbit Ring (Reverse/Offset) */}
            <div className="absolute inset-1 rounded-full border-2 border-primary-green/40 border-b-primary-green animate-[spin_1.5s_linear_infinite_reverse]"></div>

            {/* Central Eco Core */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-primary-green to-neon-cyan shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse"></div>
        </div>
    );
};

export default LoadingSpinner;
