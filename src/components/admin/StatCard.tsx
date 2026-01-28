import React from 'react';
import AnimatedCounter from '../AnimatedCounter';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
    const isNumeric = typeof value === 'number';
    const numericValue = isNumeric ? value : parseFloat(value.replace(/[^0-9.]/g, ''));

    // Extract color base from colorClass string (simple heuristic for demo, or hardcode mapping if needed)
    // For now, adhering to the prop passed but wrapping in better styling.

    return (
        <div className="relative overflow-hidden bg-white dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">

            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {isNumeric ? (
                            <AnimatedCounter target={numericValue} />
                        ) : (
                            value
                        )}
                    </div>
                </div>

                <div className={`hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300`}>
                    {/* Icon wrapper to ensure contrast and size */}
                    <div className="w-6 h-6">
                        {icon}
                    </div>
                </div>
            </div>
            {/* Optional: Add a sparkline or trend indicator here in future */}
        </div>
    );
};

export default StatCard;
