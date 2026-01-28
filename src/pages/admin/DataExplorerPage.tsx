import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLeadsData } from '../../service/adminService';
import { Lead, CalculatorType, PipelineStage } from '../../types';
import Pagination from '../../components/admin/Pagination';
import { PIPELINE_STAGES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/admin/Card';
import ImportLeadsModal from '../../components/admin/ImportLeadsModal';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';


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
    if (!direction) return <span className="text-gray-500">↕</span>;
    return direction === 'ascending' ? <span className="text-gray-800 dark:text-text-light">↑</span> : <span className="text-gray-800 dark:text-text-light">↓</span>;
};

// FIX: Updated SkeletonLoader to correctly use Card component with children.
const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-secondary-background rounded w-1/4 mb-6"></div>
        <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-10 bg-gray-100 dark:bg-primary-background rounded-lg" />
                <div className="h-10 bg-gray-100 dark:bg-primary-background rounded-lg" />
                <div className="h-10 bg-gray-100 dark:bg-primary-background rounded-lg" />
                <div className="h-10 bg-gray-100 dark:bg-primary-background rounded-lg" />
            </div>
        </Card>
        <Card>
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 dark:bg-primary-background rounded"></div>
                ))}
            </div>
        </Card>
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

    const inputClasses = "w-full px-3 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-accent-blue outline-none transition-all placeholder:text-gray-400";
    const btnBase = "flex items-center justify-center font-bold py-2 sm:py-2.5 px-4 rounded-lg shadow-md transition-all transform active:scale-95 text-xs sm:text-sm";
    const btnExport = `${btnBase} bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-cyan-500/20`;
    const btnImport = `${btnBase} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/20`;

    return (
        <div className="p-2 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-text-light mb-3 sm:mb-6 px-1">Data Explorer</h2>

            <Card className="mb-4 sm:mb-6 !p-3 sm:!p-6">
                <div className="grid grid-cols-2 lg:flex items-center gap-2 sm:gap-4">
                    <div className="col-span-2 lg:col-span-1 lg:flex-grow lg:w-auto min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className={inputClasses}
                        />
                    </div>
                    <select name="productType" value={filters.productType} onChange={handleFilterChange} className={inputClasses}>
                        <option value="all">All Products</option>
                        <option value={CalculatorType.Rooftop}>Rooftop Solar</option>
                        <option value={CalculatorType.Pump}>Solar Pump</option>
                        <option value="Contact Inquiry">Contact Inquiry</option>
                    </select>
                    <select name="pipelineStage" value={filters.pipelineStage} onChange={handleFilterChange} className={inputClasses}>
                        <option value="all">All Stages</option>
                        {PIPELINE_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                    </select>
                    <button onClick={handleExport} className={btnExport}>
                        Export CSV
                    </button>
                    {user?.role === 'Master' && (
                        <button onClick={() => setIsImportModalOpen(true)} className={btnImport}>
                            Import CSV
                        </button>
                    )}
                </div>
            </Card>

            <Card className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('name')}>
                                    Name <SortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : undefined} />
                                </th>
                                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stage</th>
                                {user?.role === 'Master' && (
                                    <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor</th>
                                )}
                                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('score')}>
                                    Score <SortIcon direction={sortConfig.key === 'score' ? sortConfig.direction : undefined} />
                                </th>
                                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('createdAt')}>
                                    Date <SortIcon direction={sortConfig.key === 'createdAt' ? sortConfig.direction : undefined} />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {paginatedLeads.map(lead => (
                                <tr key={lead.id} onClick={() => navigate(`/admin/leads/${lead.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-green transition-colors">{lead.name}</div>
                                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{lead.email}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300 capitalize">{lead.productType}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 inline-flex text-[10px] sm:text-xs font-bold rounded-full border ${getStageColor(lead.pipelineStage).replace('text-', 'border-').replace('/20', '/30')}`}>
                                            {lead.pipelineStage}
                                        </span>
                                    </td>
                                    {user?.role === 'Master' && (
                                        <td className="px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            {lead.assignedVendorName ? (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    {lead.assignedVendorName}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 inline-flex text-[10px] sm:text-xs font-bold rounded-full ${getStatusColor(lead.scoreStatus)}`}>
                                            {lead.scoreStatus} ({lead.score})
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredAndSortedLeads.length / ITEMS_PER_PAGE)}
                onPageChange={setCurrentPage}
            />

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