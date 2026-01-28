import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface MonthlyLeadsChartProps {
    data: { name: string; leads: number }[];
}

const MonthlyLeadsChart: React.FC<MonthlyLeadsChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    const axisColor = isDarkMode ? '#94a3b8' : '#6b7280'; // text-secondary vs text-gray-500
    const tooltipStyles = {
        background: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        border: isDarkMode ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: isDarkMode ? '0 0 10px rgba(6, 182, 212, 0.2)' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    };
    const labelStyle = { color: isDarkMode ? '#f8fafc' : '#111827' };
    const itemStyle = { color: isDarkMode ? '#67e8f9' : '#06b6d4', fontWeight: 'bold' };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorLeadsBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: axisColor }}
                    dy={10}
                />
                <YAxis
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: axisColor }}
                />
                <Tooltip
                    cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                    contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        padding: '8px 12px'
                    }}
                    labelStyle={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '4px', fontSize: '12px' }}
                    itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a', fontWeight: 600, fontSize: '14px', padding: 0 }}
                />
                <Bar
                    dataKey="leads"
                    fill="url(#colorLeadsBar)"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    animationDuration={1000}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default React.memo(MonthlyLeadsChart);