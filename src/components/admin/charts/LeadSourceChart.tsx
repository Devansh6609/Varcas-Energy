import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface LeadSourceChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#22d3ee', '#818cf8', '#34d399', '#f472b6'];

const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <defs>
                    {COLORS.map((color, index) => (
                        <filter key={`glow-${index}`} id={`glow-${index}`}>
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    ))}
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="#000" floodOpacity="0.5" />
                    </filter>
                </defs>
                <Pie
                    data={data}
                    cx="50%"
                    cy="80%"
                    startAngle={180}
                    endAngle={0}
                    labelLine={false}
                    outerRadius={160}
                    innerRadius={110}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={6}
                    cornerRadius={12}
                    stroke="none"
                    animationBegin={0}
                    animationDuration={2000}
                    animationEasing="ease-out"
                    style={{ filter: 'url(#shadow)' }}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{ filter: `url(#glow-${index % COLORS.length})` }}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(12px)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        padding: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '14px', padding: 0 }}
                    cursor={{ fill: 'transparent' }}
                />
                <Legend
                    iconSize={12}
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: '0px' }}
                    formatter={(value) => (
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 hover:text-text-primary transition-colors">
                            {value}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default React.memo(LeadSourceChart);
