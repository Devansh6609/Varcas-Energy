import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface LeadSourceChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#22d3ee', '#818cf8', '#34d399', '#f472b6'];

const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    const tooltipStyles = {
        background: isDarkMode ? '#1e293b' : '#ffffff',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        padding: '8px 12px'
    };

    const legendStyle = {
        color: isDarkMode ? '#cbd5e1' : '#475569',
        fontSize: '12px',
        fontWeight: 500
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={85}
                    innerRadius={60}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={4}
                    cornerRadius={6}
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={tooltipStyles}
                    itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a', fontWeight: 600, fontSize: '13px', padding: 0 }}
                    cursor={{ fill: 'transparent' }}
                />
                <Legend
                    iconSize={10}
                    iconType="circle"
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={legendStyle}
                    formatter={(value) => <span style={{ color: isDarkMode ? '#cbd5e1' : '#475569', marginLeft: '5px' }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default React.memo(LeadSourceChart);