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

    return (
        <div className="bg-white dark:bg-glass-surface dark:backdrop-blur-lg p-3 md:p-4 rounded-xl shadow-lg dark:shadow-black/20 transition-all duration-300 hover:shadow-xl dark:hover:shadow-glow-sm dark:hover:shadow-black/30 hover:-translate-y-1 border border-gray-200 dark:border-glass-border dark:hover:border-glow-cyan/50 h-full flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <h4 className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider truncate">{title}</h4>
                    <div className="mt-0.5 md:mt-1 text-xl md:text-3xl font-bold text-gray-900 dark:text-text-primary font-mono truncate">
                        {isNumeric ? (
                            <AnimatedCounter target={numericValue} />
                        ) : (
                            value
                        )}
                    </div>
                </div>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg shadow-black/30 flex-shrink-0 ${colorClass}`}>
                    {/* Scale icon down slightly on mobile */}
                    <div className="scale-75 md:scale-100 transform origin-center">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
