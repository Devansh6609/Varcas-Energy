import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Lead, LeadScoreStatus, PipelineStage, User } from '../../types';
import { getLeads, getVendors, getStates, getDistricts, updateLead, performBulkLeadAction } from '../../service/adminService';
import { PIPELINE_STAGES } from '../../constants';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/admin/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

type LeadsByStage = { [key in PipelineStage]: Lead[] };

const getStatusColor = (status: LeadScoreStatus) => {
    switch (status) {
        case 'Hot': return 'bg-status-red/20 text-status-red';
        case 'Warm': return 'bg-status-yellow/20 text-status-yellow';
        case 'Cold': return 'bg-electric-blue/20 text-electric-blue';
        default: return 'bg-gray-500/20 text-text-muted';
    }
}

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <span className="text-gray-400 dark:text-gray-500 inline-block w-4 h-4 text-center">↕</span>;
    return direction === 'ascending' ? <span className="text-gray-900 dark:text-text-primary">↑</span> : <span className="text-gray-900 dark:text-text-primary">↓</span>;
};

const LeadsListPage: React.FC = () => {
    const [leadsByStage, setLeadsByStage] = useState<LeadsByStage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lastUpdate, triggerUpdate } = useCrmUpdates();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [selectedStage, setSelectedStage] = useState<PipelineStage>(PipelineStage.NewLead);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });

    const [filters, setFilters] = useState({
        assignedVendorId: 'all',
        state: 'all',
        district: 'all',
        source: 'all',
    });
    const [vendors, setVendors] = useState<User[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);

    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [bulkStage, setBulkStage] = useState('');
    const [bulkVendor, setBulkVendor] = useState('');
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.role === 'Master') {
            getVendors().then(setVendors);
            getStates().then(setStates);
        }
    }, [user]);

    useEffect(() => {
        if (filters.state && filters.state !== 'all') {
            getDistricts(filters.state).then(setDistricts);
        } else {
            setDistricts([]);
        }
    }, [filters.state]);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setLoading(true);

                const activeFilters: Record<string, string> = {};
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== 'all' && value !== '') activeFilters[key] = value;
                });

                const allLeads = await getLeads(activeFilters);

                const initialColumns: LeadsByStage = PIPELINE_STAGES.reduce((acc, stage) => ({ ...acc, [stage]: [] }), {} as LeadsByStage);

                const groupedLeads = allLeads.reduce((acc: LeadsByStage, lead: Lead) => {
                    if (acc[lead.pipelineStage]) acc[lead.pipelineStage].push(lead);
                    return acc;
                }, initialColumns);

                setLeadsByStage(groupedLeads);

            } catch (err) { setError('Failed to load leads.'); }
            finally { setLoading(false); }
        };
        fetchLeads();
    }, [lastUpdate, filters]);

    const sortedLeads = useMemo(() => {
        if (!leadsByStage || !leadsByStage[selectedStage]) return [];
        const leadsToSort = [...leadsByStage[selectedStage]];

        leadsToSort.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return leadsToSort;

    }, [leadsByStage, selectedStage, sortConfig]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedLeads.length;
            const numSorted = sortedLeads.length;
            headerCheckboxRef.current.checked = numSelected === numSorted && numSorted > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numSorted;
        }
    }, [selectedLeads, sortedLeads]);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination || !leadsByStage) return;

        const startStage = source.droppableId as PipelineStage;
        const endStage = destination.droppableId as PipelineStage;

        if (startStage === endStage && source.index === destination.index) return;

        const originalState = { ...leadsByStage };

        const sourceLeads = Array.from(leadsByStage[startStage]);
        const destLeads = startStage === endStage ? sourceLeads : Array.from(leadsByStage[endStage]);

        const [movedLead] = sourceLeads.splice(source.index, 1);
        destLeads.splice(destination.index, 0, movedLead);

        const newState = {
            ...leadsByStage,
            [startStage]: sourceLeads,
            [endStage]: destLeads
        };

        setLeadsByStage(newState);

        // If moving between stages, update backend
        if (startStage !== endStage) {
            try {
                await updateLead(draggableId, { pipelineStage: endStage });
            } catch (error) {
                setError("Failed to update lead stage. Reverting change.");
                setLeadsByStage(originalState);
            }
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'state') newFilters.district = 'all';
            return newFilters;
        });
    };

    const handleSort = (key: keyof Lead) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedLeads(sortedLeads.map(l => l.id));
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedLeads(prev => [...prev, id]);
        } else {
            setSelectedLeads(prev => prev.filter(lId => lId !== id));
        }
    };

    const handleBulkAction = async (action: 'changeStage' | 'assignVendor', value: string) => {
        if (!selectedLeads.length || !value) return;
        if (!confirm(`Are you sure you want to ${action === 'changeStage' ? 'change stage for' : 'assign vendor to'} ${selectedLeads.length} leads?`)) return;

        try {
            await performBulkLeadAction(
                action,
                value,
                selectedLeads
            );
            triggerUpdate();
            setSelectedLeads([]);
            setBulkStage('');
            setBulkVendor('');
        } catch (err) {
            setError('Failed to perform bulk action.');
        }
    };

    const formElementClasses = "block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-glass-border focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm rounded-md dark:bg-glass-surface dark:text-text-primary transition-all duration-300";

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-text-primary tracking-tight">Leads Management</h1>
                    <p className="text-sm text-gray-500 dark:text-text-secondary mt-1">Track and manage your sales pipeline.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-gray-100 dark:bg-glass-surface p-1 rounded-lg flex border border-gray-200 dark:border-white/10">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow text-primary-green dark:text-neon-cyan' : 'text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-white/5'}`} title="List View" aria-label="List View">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <button onClick={() => setViewMode('board')} className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-white/10 shadow text-primary-green dark:text-neon-cyan' : 'text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-white/5'}`} title="Board View" aria-label="Board View">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                        </button>
                    </div>
                    <a href="http://localhost:5000/api/admin/leads/export" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green-hover transition-colors shadow-lg shadow-primary-green/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="hidden sm:inline">Export CSV</span>
                    </a>
                </div>
            </div>

            <div className="glass-panel p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {user?.role === 'Master' && (
                    <select name="assignedVendorId" value={filters.assignedVendorId} onChange={handleFilterChange} className={formElementClasses} aria-label="Filter by Vendor" title="Filter by Vendor">
                        <option value="all">All Vendors</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                )}
                <select name="source" value={filters.source} onChange={handleFilterChange} className={formElementClasses} aria-label="Filter by Source" title="Filter by Source">
                    <option value="all">All Sources</option>
                    <option value="Online">Online Leads</option>
                    <option value="Offline">Offline Leads</option>
                </select>
                <select name="state" value={filters.state} onChange={handleFilterChange} className={formElementClasses} aria-label="Filter by State" title="Filter by State">
                    <option value="all">All States</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select name="district" value={filters.district} onChange={handleFilterChange} className={formElementClasses} disabled={filters.state === 'all'} aria-label="Filter by District" title="Filter by District">
                    <option value="all">All Districts</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            ) : error ? (
                <div className="text-center p-8 text-status-red">{error}</div>
            ) : leadsByStage && (
                <DragDropContext onDragEnd={onDragEnd}>
                    {viewMode === 'list' ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                                {PIPELINE_STAGES.map(stage => (
                                    <div
                                        key={stage}
                                        onClick={() => { setSelectedStage(stage); setSelectedLeads([]) }}
                                        className={`p-3 rounded-lg cursor-pointer border-2 transition-all duration-300
                                                        ${selectedStage === stage ? 'border-primary-green dark:border-neon-cyan bg-primary-green/10 dark:bg-neon-cyan/20 scale-105 shadow-md' : 'border-gray-200 dark:border-glass-border bg-gray-50 dark:bg-glass-surface hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                    >
                                        <p className={`text-xs font-semibold truncate ${selectedStage === stage ? 'text-primary-green dark:text-neon-cyan' : 'text-gray-500 dark:text-text-secondary'}`}>{stage}</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-text-primary mt-1">{leadsByStage[stage]?.length || 0}</p>
                                    </div>
                                ))}
                            </div>

                            <Card className="glass-card">
                                {selectedLeads.length > 0 && (
                                    <div className="p-4 bg-electric-blue/10 dark:bg-electric-blue/20 border-b border-electric-blue/30 flex flex-wrap items-center gap-4 rounded-t-lg">
                                        <span className="text-sm font-semibold text-electric-blue dark:text-text-accent">{selectedLeads.length} selected</span>
                                        <div className="flex items-center gap-2">
                                            <select value={bulkStage} onChange={e => setBulkStage(e.target.value)} className={`${formElementClasses} py-1`} aria-label="Select Bulk Stage" title="Select Bulk Stage">
                                                <option value="">Change Stage...</option>
                                                {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <button onClick={() => handleBulkAction('changeStage', bulkStage)} disabled={!bulkStage} className="px-3 py-1 text-xs font-semibold text-white bg-electric-blue rounded-md hover:bg-electric-blue-hover disabled:bg-gray-500">Apply</button>
                                        </div>
                                        {user?.role === 'Master' && (
                                            <div className="flex items-center gap-2">
                                                <select value={bulkVendor} onChange={e => setBulkVendor(e.target.value)} className={`${formElementClasses} py-1`} aria-label="Select Bulk Vendor" title="Select Bulk Vendor">
                                                    <option value="">Assign Vendor...</option>
                                                    <option value="unassigned">Unassigned</option>
                                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                                <button onClick={() => handleBulkAction('assignVendor', bulkVendor)} disabled={!bulkVendor} className="px-3 py-1 text-xs font-semibold text-white bg-electric-blue rounded-md hover:bg-electric-blue-hover disabled:bg-gray-500">Apply</button>
                                            </div>
                                        )}
                                        <button onClick={() => setSelectedLeads([])} className="ml-auto text-xs text-gray-600 dark:text-text-secondary hover:underline">Clear</button>
                                    </div>
                                )}

                                <div className="overflow-x-auto hidden md:block">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-border-color">
                                        <thead className="bg-gray-50 dark:bg-secondary-background/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left"><input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="rounded border-gray-300 dark:border-gray-600 text-electric-blue focus:ring-electric-blue dark:bg-gray-700" aria-label="Select All Leads" title="Select All Leads" /></th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>Name <SortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : undefined} /></th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Source</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Product</th>
                                                {user?.role === 'Master' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Assigned To</th>}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('score')}>Score <SortIcon direction={sortConfig.key === 'score' ? sortConfig.direction : undefined} /></th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>Date <SortIcon direction={sortConfig.key === 'createdAt' ? sortConfig.direction : undefined} /></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-secondary-background divide-y divide-gray-200 dark:divide-border-color">
                                            {sortedLeads.length > 0 ? sortedLeads.map((lead) => (
                                                <tr key={lead.id} className={`hover:bg-gray-50 dark:hover:bg-primary-background transition-colors ${selectedLeads.includes(lead.id) ? 'bg-electric-blue/10' : ''}`}>
                                                    <td className="px-4 py-4"><input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={(e) => handleSelectOne(e, lead.id)} className="rounded border-gray-300 dark:border-gray-600 text-electric-blue focus:ring-electric-blue dark:bg-gray-700" aria-label={`Select lead ${lead.name}`} title={`Select lead ${lead.name}`} /></td>
                                                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}><div className="text-sm font-medium text-gray-900 dark:text-text-primary">{lead.name || 'N/A'}</div><div className="text-sm text-gray-500 dark:text-text-secondary">{lead.email}</div><div className="text-sm text-gray-500 dark:text-text-secondary">{lead.phone}</div></td>
                                                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.source === 'Manual_Offline' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                            {lead.source === 'Manual_Offline' ? 'Offline' : 'Online'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-secondary cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}>{lead.productType}</td>
                                                    {user?.role === 'Master' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-secondary cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}>{lead.assignedVendorName || 'Unassigned'}</td>}
                                                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.scoreStatus)}`}>{lead.scoreStatus} ({lead.score})</span></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-secondary cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            )) : (<tr><td colSpan={user?.role === 'Master' ? 6 : 5} className="text-center py-8 text-gray-500 dark:text-text-secondary">No leads in this stage.</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="md:hidden">
                                    {sortedLeads.length > 0 ? sortedLeads.map((lead) => (
                                        <div key={lead.id} className={`border-b border-gray-200 dark:border-border-color ${selectedLeads.includes(lead.id) ? 'bg-electric-blue/10' : ''}`}>
                                            <div className="flex items-start gap-3 p-4">
                                                <div className="pt-1"><input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={(e) => handleSelectOne(e, lead.id)} className="rounded border-gray-300 dark:border-gray-600 text-electric-blue focus:ring-electric-blue dark:bg-gray-700" aria-label={`Select lead ${lead.name}`} title={`Select lead ${lead.name}`} /></div>
                                                <div className="flex-grow" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-text-primary">{lead.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-text-secondary">{lead.email}</p>
                                                        </div>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.scoreStatus)}`}>{lead.scoreStatus} ({lead.score})</span>
                                                    </div>
                                                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                        <div><p className="text-gray-500 dark:text-text-muted">Product</p><p className="font-medium text-gray-800 dark:text-text-light">{lead.productType}</p></div>
                                                        <div><p className="text-gray-500 dark:text-text-muted">Phone</p><p className="font-medium text-gray-800 dark:text-text-light">{lead.phone}</p></div>
                                                        <div><p className="text-gray-500 dark:text-text-muted">Date</p><p className="font-medium text-gray-800 dark:text-text-light">{new Date(lead.createdAt).toLocaleDateString()}</p></div>
                                                        {user?.role === 'Master' && (<div><p className="text-gray-500 dark:text-text-muted">Assigned</p><p className="font-medium text-gray-800 dark:text-text-light truncate">{lead.assignedVendorName || 'Unassigned'}</p></div>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (<div className="text-center py-8 text-sm text-gray-500 dark:text-text-secondary">No leads in this stage.</div>)}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <div className="flex overflow-x-auto pb-4 gap-4 h-[calc(100vh-250px)]">
                            {PIPELINE_STAGES.map(stage => (
                                <Droppable droppableId={stage} key={stage}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-w-[280px] w-[280px] flex flex-col rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-white/10' : 'bg-gray-50 dark:bg-glass-surface border border-gray-200 dark:border-glass-border'}`}
                                        >
                                            <div className="p-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
                                                <h3 className="font-semibold text-gray-700 dark:text-text-primary text-sm uppercase tracking-wide">{stage}</h3>
                                                <span className="bg-gray-200 dark:bg-white/20 text-gray-700 dark:text-white text-xs font-bold px-2 py-0.5 rounded-full">{leadsByStage[stage]?.length || 0}</span>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                                                {leadsByStage[stage]?.map((lead, index) => (
                                                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => navigate(`/admin/leads/${lead.id}`)}
                                                                className={`bg-white dark:bg-secondary-background p-3 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-xl ring-2 ring-neon-cyan rotate-2' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getStatusColor(lead.scoreStatus)}`}>{lead.scoreStatus}</span>
                                                                    <span className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <h4 className="font-bold text-gray-900 dark:text-text-primary text-sm mb-1 truncate">{lead.name}</h4>
                                                                <p className="text-xs text-gray-500 dark:text-text-secondary mb-2 truncate">{lead.productType}</p>

                                                                {user?.role === 'Master' && (
                                                                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                                                                        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-white/20 flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-300">
                                                                            {lead.assignedVendorName ? lead.assignedVendorName.charAt(0) : '?'}
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 dark:text-text-muted truncate max-w-[150px]">{lead.assignedVendorName || 'Unassigned'}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    )}
                </DragDropContext>
            )}
        </div>
    );
};

export default LeadsListPage;