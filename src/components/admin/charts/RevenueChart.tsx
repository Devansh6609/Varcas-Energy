import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface RevenueChartProps {
    data: { name: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    const axisColor = isDarkMode ? 'rgba(148, 163, 184, 0.5)' : '#6b7280';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
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
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                />
                <Tooltip
                    cursor={{ stroke: 'rgba(16, 185, 129, 0.3)', strokeWidth: 2 }}
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(12px)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        padding: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    labelStyle={{ color: 'rgba(148, 163, 184, 0.8)', marginBottom: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '16px', padding: 0 }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981', filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))' }}
                    animationDuration={2000}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default React.memo(RevenueChart);
