import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getVendors, getDashboardStats, getChartData } from '../../service/adminService';
import StatCard from '../../components/admin/StatCard';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import Card from '../../components/admin/Card';
import MonthlyLeadsChart from '../../components/admin/charts/MonthlyLeadsChart';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import TaskWidget from '../../components/admin/TaskWidget';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

import {
    Users, UserCheck, Trophy, IndianRupee, Calendar,
    Filter, Search, Zap, Activity
} from 'lucide-react';

const kpiIcons = {
    totalLeads: {
        icon: <Users size={24} />,
        colorClass: 'text-neon-cyan'
    },
    verifiedLeads: {
        icon: <UserCheck size={24} />,
        colorClass: 'text-electric-blue'
    },
    projectsWon: {
        icon: <Trophy size={24} />,
        colorClass: 'text-bright-violet'
    },
    pipelineValue: {
        icon: <IndianRupee size={24} />,
        colorClass: 'text-status-green'
    },
};

const GroupByToggle: React.FC<{ value: string, onChange: (value: string) => void }> = ({ value, onChange }) => {
    const options = ['day', 'week', 'month'];
    return (
        <div className="flex bg-white/5 border border-glass-border/30 rounded-2xl p-1 gap-1">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${value === opt
                        ? 'bg-neon-cyan text-white shadow-glow-sm shadow-neon-cyan/40'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lastUpdate } = useCrmUpdates();
    const { user } = useAuth();

    const [filters, setFilters] = useState({
        vendorId: 'all',
        startDate: '',
        endDate: '',
    });
    const [groupBy, setGroupBy] = useState('month');
    const [vendors, setVendors] = useState<User[]>([]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (user?.role === 'Master') {
            getVendors().then(setVendors).catch(err => setError('Could not load vendors.'));
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, chartsData] = await Promise.all([
                    getDashboardStats(filters),
                    getChartData({ ...filters, groupBy })
                ]);
                setStats(statsData);
                setChartData(chartsData);
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters, groupBy, lastUpdate]);

    const filterInputClasses = "bg-white/5 border border-glass-border/30 text-text-primary text-xs font-bold rounded-2xl focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan block w-full px-4 py-3 transition-all appearance-none outline-none";

    return (
        <div className="p-4 sm:p-8 lg:p-12 max-w-[1800px] mx-auto animate-fade-in-up space-y-10 font-inter">
            {/* Executive Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap size={12} className="fill-neon-cyan" />
                            Insights Hub
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                        Executive <span className="text-neon-cyan">Overview</span>
                    </h1>
                    <p className="text-text-secondary/60 text-sm font-bold">
                        Welcome back, <span className="text-text-primary">{user?.name}</span>. Here's your solar performance today.
                    </p>
                </div>
            </div>

            {/* Filter Row */}
            <div className="bg-glass-surface/20 backdrop-blur-3xl border border-glass-border/30 rounded-[2.5rem] p-6 lg:p-8 flex flex-col xl:flex-row items-stretch xl:items-center gap-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {user?.role === 'Master' && (
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-neon-cyan transition-colors" />
                            <select
                                name="vendorId"
                                value={filters.vendorId}
                                title="Vendor Filter"
                                onChange={handleFilterChange}
                                className={`${filterInputClasses} pl-12`}
                            >
                                <option value="all">All Global Vendors</option>
                                {vendors.map(v => <option key={v.id} value={v.id} className="bg-night-sky">{v.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-neon-cyan transition-colors" />
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            title="Start Date"
                            onChange={handleFilterChange}
                            className={`${filterInputClasses} pl-12`}
                        />
                    </div>
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-neon-cyan transition-colors" />
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            title="End Date"
                            onChange={handleFilterChange}
                            className={`${filterInputClasses} pl-12`}
                        />
                    </div>
                </div>

                <div className="xl:pl-6 xl:border-l border-glass-border/20">
                    <GroupByToggle value={groupBy} onChange={setGroupBy} />
                </div>

                <button className="px-8 py-3 rounded-2xl bg-neon-cyan text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-glow-sm shadow-neon-cyan/20 hover:scale-105 active:scale-95 transition-all">
                    Generate Report
                </button>
            </div>

            {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="space-y-10 pb-12">
                    {/* KPI Stratosphere */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Pipeline Leads"
                            value={stats?.totalLeads ?? 0}
                            {...kpiIcons.totalLeads}
                            trend={{ value: 12.5, isPositive: true }}
                        />
                        <StatCard
                            title="Verified Installations"
                            value={stats?.verifiedLeads ?? 0}
                            {...kpiIcons.verifiedLeads}
                            trend={{ value: 3.2, isPositive: true }}
                        />
                        <StatCard
                            title="Solar Projects Won"
                            value={stats?.projectsWon ?? 0}
                            {...kpiIcons.projectsWon}
                            trend={{ value: 1.4, isPositive: false }}
                        />
                        <StatCard
                            title="Total Pipeline Value"
                            value={`₹${((stats?.pipelineValue ?? 0) / 10000000).toFixed(2)}Cr`}
                            {...kpiIcons.pipelineValue}
                            trend={{ value: 8.7, isPositive: true }}
                        />
                    </div>

                    {/* Analytics Grid */}
                    <div className="space-y-8">
                        {/* Top Row: Performance & Trajectory */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <Card className="!p-8 group relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 blur-[100px] pointer-events-none" />
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-text-primary tracking-tight group-hover:text-neon-cyan transition-colors">Leads Performance</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Real-time acquisition velocity</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                                        <Activity size={20} />
                                    </div>
                                </div>
                                <div className="h-[280px]">
                                    <MonthlyLeadsChart data={chartData?.timeSeriesLeads ?? []} />
                                </div>
                            </Card>

                            <Card className="!p-8 group relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/5 blur-[100px] pointer-events-none" />
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-text-primary tracking-tight group-hover:text-electric-blue transition-colors">Revenue Trajectory</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Financial growth projections</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-electric-blue/10 text-electric-blue">
                                        <IndianRupee size={20} />
                                    </div>
                                </div>
                                <div className="h-[280px]">
                                    <RevenueChart data={chartData?.timeSeriesRevenue ?? []} />
                                </div>
                            </Card>
                        </div>

                        {/* Bottom Row: Action Center */}
                        <div className="w-full">
                            <Card className="!p-0 overflow-hidden bg-glass-surface/30 group">
                                <div className="p-8 pb-4 flex items-center justify-between border-b border-glass-border/5">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-text-primary tracking-tight">Action Center</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Critical pending tasks</p>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-error-red animate-ping" />
                                </div>
                                <TaskWidget tasks={stats?.tasks} />
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
