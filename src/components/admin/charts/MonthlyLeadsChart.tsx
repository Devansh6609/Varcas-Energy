import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface MonthlyLeadsChartProps {
    data: { name: string; leads: number }[];
}

const MonthlyLeadsChart: React.FC<MonthlyLeadsChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    const axisColor = isDarkMode ? 'rgba(148, 163, 184, 0.5)' : '#6b7280';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorLeadsBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"} />
                <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: axisColor, fontWeight: 700 }}
                    dy={10}
                />
                <YAxis
                    stroke={axisColor}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: axisColor, fontWeight: 700 }}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(34, 211, 238, 0.05)' }}
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(12px)',
                        borderColor: 'rgba(34, 211, 238, 0.3)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        padding: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    labelStyle={{ color: 'rgba(148, 163, 184, 0.8)', marginBottom: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '16px', padding: 0 }}
                />
                <Bar
                    dataKey="leads"
                    fill="url(#colorLeadsBar)"
                    radius={[8, 8, 2, 2]}
                    barSize={40}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    style={{ filter: 'url(#glow)' }}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default React.memo(MonthlyLeadsChart);
