import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
    const baseClasses = "animate-pulse bg-gray-700/50 rounded";

    // Additional classes for specific variants if needed, 
    // but mostly relying on className for sizing.
    const variantClasses = {
        text: "h-4 w-full rounded",
        circular: "rounded-full",
        rectangular: "rounded-md",
    };

    return (
        <div
            className={`
                ${baseClasses} 
                ${variantClasses[variant]} 
                ${className}
            `}
        />
    );
};

export default Skeleton;
