import React from 'react';
import Skeleton from '../ui/Skeleton';

const WebsitePageSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-night-sky flex flex-col">
            {/* Navbar Skeleton */}
            <div className="h-20 border-b border-glass-border bg-glass-surface/30 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <Skeleton className="h-10 w-32 md:w-48 bg-gray-600/50" />

                {/* Desktop Nav Items */}
                <div className="hidden md:flex space-x-8">
                    <Skeleton variant="text" className="w-20 bg-gray-600/50" />
                    <Skeleton variant="text" className="w-20 bg-gray-600/50" />
                    <Skeleton variant="text" className="w-20 bg-gray-600/50" />
                    <Skeleton variant="text" className="w-20 bg-gray-600/50" />
                </div>

                {/* Mobile Menu Icon */}
                <Skeleton variant="circular" className="h-10 w-10 md:hidden bg-gray-600/50" />
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-grow flex flex-col">

                {/* Hero Section Placeholder */}
                <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-800/20 flex flex-col justify-center items-center px-4 space-y-6">
                    <Skeleton className="h-12 w-3/4 md:w-1/2 bg-gray-700/40" />
                    <Skeleton className="h-6 w-full md:w-2/3 bg-gray-700/30" />
                    <div className="flex space-x-4 mt-8">
                        <Skeleton className="h-12 w-40 bg-gray-700/40 rounded-full" />
                        <Skeleton className="h-12 w-40 bg-gray-700/30 rounded-full" />
                    </div>
                </div>

                {/* Content Sections Placeholder */}
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16">

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 rounded-xl bg-glass-surface/20 border border-glass-border p-6 flex flex-col space-y-4">
                                <Skeleton variant="circular" className="h-12 w-12 bg-gray-700/50" />
                                <Skeleton className="h-6 w-3/4 bg-gray-700/50" />
                                <Skeleton className="h-20 w-full bg-gray-700/30" />
                            </div>
                        ))}
                    </div>

                    {/* Text Block */}
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3 bg-gray-700/50" />
                        <Skeleton className="h-4 w-full bg-gray-700/30" />
                        <Skeleton className="h-4 w-full bg-gray-700/30" />
                        <Skeleton className="h-4 w-2/3 bg-gray-700/30" />
                    </div>

                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="h-64 bg-black/40 border-t border-glass-border"></div>
        </div>
    );
};

export default WebsitePageSkeleton;
