import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLeadsData } from '../../service/adminService';
import { Lead, CalculatorType, PipelineStage } from '../../types';
import Pagination from '../../components/admin/Pagination';
import { PIPELINE_STAGES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import ImportLeadsModal from '../../components/admin/ImportLeadsModal';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import { Database, Search, Download, Upload, ChevronUp, ChevronDown } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';


const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Hot': return 'bg-error-red/20 text-error-red';
        case 'Warm': return 'bg-warning-yellow/20 text-warning-yellow';
        case 'Cold': return 'bg-accent-blue/20 text-accent-blue';
        default: return 'bg-gray-500/20 text-text-muted';
    }
};

const getStageColor = (stage: string) => {
    if (stage.includes('Won')) return 'bg-success-green/20 text-success-green';
    if (stage.includes('Lost')) return 'bg-error-red/20 text-error-red';
    if (stage.includes('Proposal') || stage.includes('Negotiation')) return 'bg-secondary-cyan/20 text-secondary-cyan';
    return 'bg-gray-500/20 text-text-muted';
};

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <span className="opacity-0 group-hover:opacity-50 transition-opacity ml-1">↕</span>;
    return direction === 'ascending' ? <ChevronUp size={14} className="ml-1 inline-block text-neon-cyan" /> : <ChevronDown size={14} className="ml-1 inline-block text-neon-cyan" />;
};

const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-10 bg-glass-surface/40 border border-glass-border/30 rounded-xl w-1/4 mb-6"></div>
        <div className="bg-glass-surface/40 border border-glass-border/30 rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-12 bg-white/5 rounded-xl border border-white/5" />
                <div className="h-12 bg-white/5 rounded-xl border border-white/5" />
                <div className="h-12 bg-white/5 rounded-xl border border-white/5" />
                <div className="h-12 bg-white/5 rounded-xl border border-white/5" />
            </div>
        </div>
        <div className="bg-glass-surface/40 border border-glass-border/30 rounded-3xl p-6">
            <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/5"></div>
                ))}
            </div>
        </div>
    </div>
);


const DataExplorerPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { lastUpdate, triggerUpdate } = useCrmUpdates();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ productType: 'all', pipelineStage: 'all' });
    const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    useEffect(() => {
        getAllLeadsData()
            .then(data => setLeads(data))
            .catch(() => setError('Failed to load leads data.'))
            .finally(() => setLoading(false));
    }, [lastUpdate]);

    const filteredAndSortedLeads = useMemo(() => {
        let filtered = [...leads];

        if (searchTerm) {
            filtered = filtered.filter(lead =>
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone.includes(searchTerm)
            );
        }

        if (filters.productType !== 'all') {
            filtered = filtered.filter(lead => lead.productType === filters.productType);
        }

        if (filters.pipelineStage !== 'all') {
            filtered = filtered.filter(lead => lead.pipelineStage === filters.pipelineStage);
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === bValue) return 0;
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [leads, searchTerm, filters, sortConfig]);

    const paginatedLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedLeads, currentPage]);

    const handleSort = (key: keyof Lead) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleImportComplete = () => {
        setIsImportModalOpen(false);
        triggerUpdate(); // Refresh the data
    }

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Product', 'Vendor', 'Stage', 'Amount'];

        const rows = filteredAndSortedLeads.map(lead => {
            const amount = lead.customFields?.bill || lead.customFields?.energyCost || '-';
            const vendor = lead.assignedVendorName || 'Unassigned';

            return [
                `"${lead.name}"`,
                `"${lead.email}"`,
                `"${lead.phone}"`,
                `"${lead.productType}"`,
                `"${vendor}"`,
                `"${lead.pipelineStage}"`,
                `"${amount}"`
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <SkeletonLoader />;
    if (error) return <div className="text-center p-8 text-error-red">{error}</div>;

    const inputClasses = "w-full pl-10 pr-4 py-3 bg-night-sky/50 border border-glass-border/30 rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all placeholder:text-text-secondary/40 appearance-none";
    const selectClasses = "w-full px-4 py-3 bg-night-sky/50 border border-glass-border/30 rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all appearance-none cursor-pointer";
    const btnBase = "flex items-center justify-center gap-2 font-black py-3 px-6 rounded-xl transition-all shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wide";
    const btnExport = `${btnBase} bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20`;
    const btnImport = `${btnBase} bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky shadow-neon-cyan/30`;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-24">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Database size={12} className="text-neon-cyan" />
                            Data Center
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                        Data <span className="text-neon-cyan">Explorer</span>
                    </h1>
                    <p className="text-text-secondary/60 text-sm font-bold">
                        Browse, filter, and export system-wide lead data.
                    </p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 p-4 sm:p-6 shadow-glow-sm shadow-neon-cyan/5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:flex items-center gap-4">
                    <div className="relative flex-grow min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads by name, email, or phone..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className={inputClasses}
                        />
                    </div>

                    <div className="relative min-w-[150px]">
                        <select name="productType" value={filters.productType} onChange={handleFilterChange} className={selectClasses}>
                            <option value="all">All Products</option>
                            <option value={CalculatorType.Rooftop}>Rooftop Solar</option>
                            <option value={CalculatorType.Pump}>Solar Pump</option>
                            <option value="Contact Inquiry">Contact Inquiry</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
                    </div>

                    <div className="relative min-w-[150px]">
                        <select name="pipelineStage" value={filters.pipelineStage} onChange={handleFilterChange} className={selectClasses}>
                            <option value="all">All Stages</option>
                            {PIPELINE_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
                    </div>

                    <div className="flex gap-4 md:col-span-2 lg:col-span-1">
                        <button onClick={handleExport} className={`${btnExport} flex-1 lg:flex-none`}>
                            <Download size={18} />
                            EXPORT
                        </button>
                        {user?.role === 'Master' && (
                            <button onClick={() => setIsImportModalOpen(true)} className={`${btnImport} flex-1 lg:flex-none`}>
                                <Upload size={18} />
                                IMPORT
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 shadow-glow-sm shadow-neon-cyan/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-glass-border/20 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">Name <SortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : undefined} /></div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest">Stage</th>
                                {user?.role === 'Master' && (
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest">Vendor</th>
                                )}
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('score')}>
                                    <div className="flex items-center">Score <SortIcon direction={sortConfig.key === 'score' ? sortConfig.direction : undefined} /></div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('createdAt')}>
                                    <div className="flex items-center">Date <SortIcon direction={sortConfig.key === 'createdAt' ? sortConfig.direction : undefined} /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/10">
                            {paginatedLeads.map(lead => (
                                <tr key={lead.id} onClick={() => navigate(`/admin/leads/${lead.id}`)} className="hover:bg-white/[0.02] cursor-pointer transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="font-bold text-text-primary group-hover:text-neon-cyan transition-colors">{lead.name}</div>
                                            <div className="text-xs text-text-secondary/60 font-mono mt-0.5">{lead.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary capitalize font-bold">
                                        {lead.productType}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-md border ${getStageColor(lead.pipelineStage).replace('text-', 'border-').replace('/20', '/30')}`}>
                                            {lead.pipelineStage}
                                        </span>
                                    </td>
                                    {user?.role === 'Master' && (
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {lead.assignedVendorName ? (
                                                <span className="flex items-center gap-2 font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-success-green shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                                    {lead.assignedVendorName}
                                                </span>
                                            ) : (
                                                <span className="text-text-secondary/40 italic text-xs">Unassigned</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-md ${getStatusColor(lead.scoreStatus)}`}>
                                            {lead.scoreStatus} ({lead.score})
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-text-secondary/60 font-mono">
                                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))}
                            {paginatedLeads.length === 0 && (
                                <tr>
                                    <td colSpan={user?.role === 'Master' ? 6 : 5} className="px-6 py-12 text-center text-text-secondary">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Database size={48} className="text-text-secondary/20" />
                                            <p className="font-bold">No leads found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredAndSortedLeads.length > ITEMS_PER_PAGE && (
                <div className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 p-2 shadow-glow-sm shadow-neon-cyan/5 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredAndSortedLeads.length / ITEMS_PER_PAGE)}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {isImportModalOpen && (
                <ImportLeadsModal
                    onClose={() => setIsImportModalOpen(false)}
                    onImportComplete={handleImportComplete}
                />
            )}
        </div>
    );
};

export default DataExplorerPage;