import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface RevenueChartProps {
    data: { name: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    const axisColor = isDarkMode ? '#94a3b8' : '#6b7280';
    const tooltipStyles = {
        background: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        border: isDarkMode ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: isDarkMode ? '0 0 10px rgba(34, 197, 94, 0.2)' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    };
    const labelStyle = { color: isDarkMode ? '#f8fafc' : '#111827' };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                />
                <Tooltip
                    cursor={{ stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        padding: '8px 12px'
                    }}
                    labelStyle={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '4px', fontSize: '12px' }}
                    itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a', fontWeight: 600, fontSize: '14px', padding: 0 }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default React.memo(RevenueChart);