import React from 'react';
import AnimatedCounter from '../AnimatedCounter';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass, trend }) => {
    const isNumeric = typeof value === 'number';
    const numericValue = isNumeric ? value : parseFloat(value.replace(/[^0-9.]/g, ''));

    return (
        <div className="relative overflow-hidden bg-glass-surface/20 backdrop-blur-2xl border border-glass-border/30 p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 hover:border-white/20">
            {/* Background Accent Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${colorClass.replace('text-', 'bg-')}`} />

            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-text-secondary/60 uppercase tracking-[0.2em] mb-2">{title}</p>
                    <div className="flex items-baseline gap-3">
                        <div className="text-3xl font-black text-text-primary tracking-tight">
                            {isNumeric ? (
                                <AnimatedCounter target={numericValue} />
                            ) : (
                                value
                            )}
                        </div>
                        {trend && (
                            <div className={`flex items-center gap-0.5 text-[10px] font-black lg:text-xs ${trend.isPositive ? 'text-status-green' : 'text-error-red'}`}>
                                <span>{trend.isPositive ? '↑' : '↓'}</span>
                                <span>{trend.value}%</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/5 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10 ${colorClass}`}>
                    <div className="h-7 w-7">
                        {icon}
                    </div>
                </div>
            </div>

            {/* Decorative bottom line */}
            <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 opacity-50 ${colorClass.replace('text-', 'bg-')}`} />
        </div>
    );
};

export default StatCard;
