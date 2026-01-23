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

const kpiIcons = {
    totalLeads: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        colorClass: 'bg-electric-blue/80 shadow-glow-sm shadow-electric-blue/50'
    },
    verifiedLeads: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>,
        colorClass: 'bg-neon-cyan/80 shadow-glow-sm shadow-neon-cyan/50'
    },
    projectsWon: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.545a6.003 6.003 0 01-5.44 4.973m0 0a6.726 6.726 0 01-2.749 1.35" /></svg>,
        colorClass: 'bg-status-green/80 shadow-glow-sm shadow-status-green/50'
    },
    pipelineValue: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        colorClass: 'bg-status-yellow/80 shadow-glow-sm shadow-status-yellow/50'
    },
};

const GroupByFilter: React.FC<{ value: string, onChange: (value: string) => void }> = ({ value, onChange }) => {
    const options = ['day', 'week', 'month'];
    return (
        <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 dark:text-text-muted mb-2 uppercase tracking-wider ml-1">Group By</label>
            <div className="flex bg-white dark:bg-glass-surface border border-gray-200 dark:border-white/10 rounded-xl p-1.5 gap-2 shadow-sm">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden ${value === opt
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

    const formElementClasses = "bg-white dark:bg-glass-surface border border-gray-200 dark:border-white/10 text-gray-900 dark:text-text-primary text-sm rounded-xl focus:ring-accent-blue focus:border-accent-blue block w-full p-2.5 shadow-sm transition-all duration-300 hover:border-accent-blue/50";

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
        <div className="p-3 md:p-6 space-y-6 md:space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                <div className="relative">
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent-blue/20 rounded-full blur-3xl pointer-events-none"></div>
                    <h1 className="text-2xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 drop-shadow-sm tracking-tight relative z-10">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-text-secondary mt-1 md:mt-2 text-sm md:text-lg font-light">
                        Overview of your performance and metrics
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full xl:w-auto bg-white/50 dark:bg-glass-surface/30 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                    <GroupByFilter value={groupBy} onChange={setGroupBy} />

                    <div className="flex flex-col w-full md:w-auto">
                        <label className="text-xs font-semibold text-gray-500 dark:text-text-muted mb-2 uppercase tracking-wider ml-1">Filters</label>
                        <div className="flex flex-wrap items-center gap-3">
                            {user?.role === 'Master' && (
                                <select
                                    name="vendorId"
                                    value={filters.vendorId}
                                    onChange={handleFilterChange}
                                    className={`${formElementClasses} min-w-[150px]`}
                                    aria-label="Filter by Vendor"
                                    title="Filter by Vendor"
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
                                className={formElementClasses}
                                aria-label="Start Date"
                                title="Start Date"
                            />
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className={formElementClasses}
                                aria-label="End Date"
                                title="End Date"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                            <StatCard title="Total Leads" value={stats.totalLeads} {...kpiIcons.totalLeads} />
                            <StatCard title="Verified Leads" value={stats.verifiedLeads} {...kpiIcons.verifiedLeads} />
                            <StatCard title="Projects Won" value={stats.projectsWon} {...kpiIcons.projectsWon} />
                            <StatCard title="Pipeline Value" value={stats.pipelineValue} {...kpiIcons.pipelineValue} />
                        </div>
                    )}

                    {chartData && stats && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                <Card className="lg:col-span-2 glass-card">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary mb-4">Leads Over Time</h3>
                                    <div className="h-72">
                                        <MonthlyLeadsChart data={chartData.timeSeriesLeads} />
                                    </div>
                                </Card>
                                <Card className="glass-card">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary mb-4">Lead Sources</h3>
                                    <div className="h-72">
                                        <LeadSourceChart data={chartData.leadSources} />
                                    </div>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <Card className="lg:col-span-2 glass-card">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary mb-4">Revenue Growth</h3>
                                    <div className="h-72">
                                        <RevenueChart data={chartData.timeSeriesRevenue} />
                                    </div>
                                </Card>
                                <TaskWidget tasks={stats.tasks} />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardPage;