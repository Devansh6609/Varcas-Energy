import React, { useState, useEffect } from 'react';
import { Lead, User } from '../../types';
import { getVendors, getDashboardStats, getChartData } from '../../service/adminService';
import StatCard from '../../components/admin/StatCard';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import Card from '../../components/admin/Card';
import MonthlyLeadsChart from '../../components/admin/charts/MonthlyLeadsChart';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import LeadSourceChart from '../../components/admin/charts/LeadSourceChart';
import TaskWidget from '../../components/admin/TaskWidget';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

import { Users, UserCheck, Trophy, IndianRupee } from 'lucide-react';

const kpiIcons = {
    totalLeads: {
        icon: <Users className="h-6 w-6" />,
        colorClass: ''
    },
    verifiedLeads: {
        icon: <UserCheck className="h-6 w-6" />,
        colorClass: ''
    },
    projectsWon: {
        icon: <Trophy className="h-6 w-6" />,
        colorClass: ''
    },
    pipelineValue: {
        icon: <IndianRupee className="h-6 w-6" />,
        colorClass: ''
    },
};

const GroupByFilter: React.FC<{ value: string, onChange: (value: string) => void }> = ({ value, onChange }) => {
    const options = ['day', 'week', 'month'];
    return (
        <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 dark:text-text-muted mb-2 uppercase tracking-wider ml-1">Group By</label>
            <div className="flex bg-white dark:bg-glass-surface border border-gray-300 dark:border-white/10 rounded-xl p-1.5 gap-2 shadow-sm">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-sm font-medium transition-all duration-300 relative overflow-hidden ${value === opt
                            ? 'bg-gradient-to-r from-accent-blue to-blue-600 text-white shadow-lg shadow-accent-blue/30 scale-105'
                            : 'text-gray-600 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                    >
                        {opt === 'day' ? 'Daily' : opt === 'week' ? 'Weekly' : 'Monthly'}
                    </button>
                ))}
            </div>
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

    const formElementClasses = "bg-white dark:bg-glass-surface border border-gray-300 dark:border-white/10 text-gray-900 dark:text-text-primary text-sm rounded-xl focus:ring-accent-blue focus:border-accent-blue block w-full p-2.5 shadow-sm transition-all duration-300 hover:border-accent-blue/50";

    // Fetch vendors for master admin's filter dropdown
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

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white dark:bg-gray-800/50 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1 sm:mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                        Welcome back, {user?.name.split(' ')[0]}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-1 rounded-xl border border-gray-100 dark:border-white/5 flex justify-center sm:justify-start">
                        <GroupByFilter value={groupBy} onChange={setGroupBy} />
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                        {user?.role === 'Master' && (
                            <select
                                name="vendorId"
                                value={filters.vendorId}
                                onChange={handleFilterChange}
                                className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-600/50 border-none text-gray-700 dark:text-gray-200 text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-accent-blue py-2 px-3 w-full sm:min-w-[140px]"
                            >
                                <option value="all">All Vendors</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        )}
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="bg-white dark:bg-gray-600/50 border-none text-gray-700 dark:text-gray-200 text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-accent-blue py-2 px-2 sm:px-3 w-full"
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="bg-white dark:bg-gray-600/50 border-none text-gray-700 dark:text-gray-200 text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-accent-blue py-2 px-2 sm:px-3 w-full"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <StatCard title="Total Leads" value={stats.totalLeads} {...kpiIcons.totalLeads} />
                            <StatCard title="Verified Leads" value={stats.verifiedLeads} {...kpiIcons.verifiedLeads} />
                            <StatCard title="Projects Won" value={stats.projectsWon} {...kpiIcons.projectsWon} />
                            <StatCard title="Pipeline Value" value={stats.pipelineValue} {...kpiIcons.pipelineValue} />
                        </div>
                    )}

                    {/* Charts Grid */}
                    {chartData && stats && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Main Chart Area */}
                            <div className="xl:col-span-2 space-y-6">
                                <Card className="!p-6 !rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leads Overview</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monthly lead acquisition trends</p>
                                        </div>
                                    </div>
                                    <div className="h-[350px]">
                                        <MonthlyLeadsChart data={chartData.timeSeriesLeads} />
                                    </div>
                                </Card>

                                <Card className="!p-6 !rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Growth</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">cumulative revenue over time</p>
                                        </div>
                                    </div>
                                    <div className="h-[350px]">
                                        <RevenueChart data={chartData.timeSeriesRevenue} />
                                    </div>
                                </Card>
                            </div>

                            {/* Sidebar Area */}
                            <div className="space-y-6">
                                <Card className="!p-6 !rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-sm h-[400px]">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Lead Sources</h3>
                                    <div className="h-[300px]">
                                        <LeadSourceChart data={chartData.leadSources} />
                                    </div>
                                </Card>

                                <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                                    <TaskWidget tasks={stats.tasks} />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardPage;