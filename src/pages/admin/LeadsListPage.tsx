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

import {
    LayoutGrid,
    List as ListIcon,
    Download,
    Filter,
    MapPin,
    User as UserIcon,
    Search,
    ChevronDown,
    MoreVertical,
    Clock,
    Zap
} from 'lucide-react';

type LeadsByStage = { [key in PipelineStage]: Lead[] };

const getStatusStyles = (status: LeadScoreStatus) => {
    switch (status) {
        case 'Hot': return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/20';
        case 'Warm': return 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/10';
        case 'Cold': return 'bg-electric-blue/10 text-electric-blue border-electric-blue/20 shadow-electric-blue/10';
        default: return 'bg-white/5 text-text-secondary border-white/10';
    }
}

const LeadsListPage: React.FC = () => {
    const [leadsByStage, setLeadsByStage] = useState<LeadsByStage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lastUpdate, triggerUpdate } = useCrmUpdates();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
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

        const newState = { ...leadsByStage, [startStage]: sourceLeads, [endStage]: destLeads };
        setLeadsByStage(newState);

        if (startStage !== endStage) {
            try {
                await updateLead(draggableId, { pipelineStage: endStage });
                triggerUpdate();
            } catch (error) {
                setError("Failed to update lead stage. Reverting change.");
                setLeadsByStage(originalState);
            }
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, ...(name === 'state' ? { district: 'all' } : {}) }));
    };

    const handleBulkAction = async (action: 'changeStage' | 'assignVendor', value: string) => {
        if (!selectedLeads.length || !value) return;
        if (!confirm(`Perform ${action === 'changeStage' ? 'stage change' : 'vendor assignment'} for ${selectedLeads.length} leads?`)) return;

        try {
            await performBulkLeadAction(action, value, selectedLeads);
            triggerUpdate();
            setSelectedLeads([]);
            setBulkStage('');
            setBulkVendor('');
        } catch (err) { setError('Failed to perform bulk action.'); }
    };

    const inputClasses = "bg-night-sky/40 backdrop-blur-md border border-glass-border/30 text-text-primary text-xs font-medium rounded-xl focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue/50 block w-full px-3 py-2.5 transition-all duration-300 hover:bg-night-sky/60 appearance-none";

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-10 space-y-8 animate-fade-in max-w-[2000px] mx-auto">
            {/* Header Section */}
            <header className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-glass-surface/30 backdrop-blur-2xl p-6 sm:px-8 sm:py-7 rounded-[2.5rem] border border-glass-border/50 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(19,236,218,0.05),transparent)] opacity-40 pointer-events-none" />

                <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-neon-cyan rounded-full animate-pulse" />
                        <span className="text-neon-cyan text-[10px] font-bold uppercase tracking-[0.3em]">Sales Pipeline</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-text-primary tracking-tight">Leads Management</h1>
                </div>

                <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
                    {/* View Switcher */}
                    <div className="bg-night-sky/40 backdrop-blur-md p-1 rounded-2xl border border-glass-border/30 flex shadow-inner-glow shadow-white/5">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`p-2.5 rounded-xl transition-all duration-500 font-bold flex items-center gap-2 text-xs ${viewMode === 'board' ? 'bg-electric-blue text-white shadow-glow-sm shadow-electric-blue/40' : 'text-text-secondary hover:bg-white/5'}`}
                        >
                            <LayoutGrid size={16} />
                            <span className="hidden sm:inline">Board</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl transition-all duration-500 font-bold flex items-center gap-2 text-xs ${viewMode === 'list' ? 'bg-electric-blue text-white shadow-glow-sm shadow-electric-blue/40' : 'text-text-secondary hover:bg-white/5'}`}
                        >
                            <ListIcon size={16} />
                            <span className="hidden sm:inline">List</span>
                        </button>
                    </div>

                    <a
                        href="http://localhost:5000/api/admin/leads/export"
                        target="_blank"
                        className="flex items-center gap-2 px-5 py-3 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-2xl hover:bg-neon-cyan/30 transition-all duration-300 shadow-glow-sm shadow-neon-cyan/10 font-bold text-sm"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Export Leads</span>
                    </a>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="glass-panel !p-6 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-[2rem]">
                <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-electric-blue transition-colors" />
                    <select name="assignedVendorId" value={filters.assignedVendorId} onChange={handleFilterChange} className={`${inputClasses} pl-10`}>
                        <option value="all">All Vendors</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
                <div className="relative group">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-neon-cyan transition-colors" />
                    <select name="source" value={filters.source} onChange={handleFilterChange} className={`${inputClasses} pl-10`}>
                        <option value="all">All Sources</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
                <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-bright-violet transition-colors" />
                    <select name="state" value={filters.state} onChange={handleFilterChange} className={`${inputClasses} pl-10`}>
                        <option value="all">All States</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-bright-violet transition-colors" />
                    <select name="district" value={filters.district} onChange={handleFilterChange} className={`${inputClasses} pl-10`} disabled={filters.state === 'all'}>
                        <option value="all">All Districts</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex justify-center items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-neon-cyan/10 blur-3xl rounded-full animate-pulse" />
                        <LoadingSpinner size="lg" />
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl text-center font-bold tracking-wide animate-fade-in">{error}</div>
            ) : leadsByStage && (
                <DragDropContext onDragEnd={onDragEnd}>
                    {viewMode === 'board' ? (
                        <div className="flex overflow-x-auto pb-8 gap-8 hide-scrollbar snap-x h-[calc(100vh-420px)] min-h-[550px] items-start">
                            {PIPELINE_STAGES.map(stage => (
                                <Droppable droppableId={stage} key={stage}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-w-[340px] w-[340px] flex flex-col rounded-[2.5rem] transition-all duration-500 h-full snap-start border ${snapshot.isDraggingOver ? 'bg-white/5 border-neon-cyan/20 ring-1 ring-neon-cyan/10' : 'bg-glass-surface/10 border-glass-border/20'}`}
                                        >
                                            <div className="p-6 flex justify-between items-center bg-white/5 backdrop-blur-md rounded-t-[2.5rem] border-b border-white/5 sticky top-0 z-10">
                                                <h3 className="font-black text-text-primary text-xs uppercase tracking-[0.2em]">{stage}</h3>
                                                <span className="bg-electric-blue/20 text-electric-blue text-[10px] font-black px-3 py-1 rounded-full border border-electric-blue/20">
                                                    {leadsByStage[stage]?.length || 0}
                                                </span>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                                {leadsByStage[stage]?.map((lead, index) => (
                                                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => navigate(`/admin/leads/${lead.id}`)}
                                                                style={{ ...provided.draggableProps.style }}
                                                                className={`bg-glass-surface/30 backdrop-blur-xl p-5 rounded-3xl border border-glass-border/30 hover:border-white/20 hover:shadow-2xl transition-all duration-300 group cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'ring-2 ring-neon-cyan shadow-glow-lg shadow-neon-cyan/20 z-50 scale-105 rotate-2' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border leading-none ${getStatusStyles(lead.scoreStatus)}`}>
                                                                        {lead.scoreStatus}
                                                                    </span>
                                                                    <div className="flex items-center gap-1 text-text-secondary/50 font-bold text-[9px] uppercase tracking-tighter">
                                                                        <Clock size={10} />
                                                                        {new Date(lead.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                                <h4 className="font-extrabold text-text-primary text-sm mb-1 group-hover:text-neon-cyan transition-colors">{lead.name}</h4>
                                                                <p className="text-[11px] text-text-secondary font-medium tracking-tight mb-4 opacity-70 truncate">{lead.productType}</p>

                                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-7 h-7 rounded-lg bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-[10px] font-black text-electric-blue">
                                                                            {lead.assignedVendorName ? lead.assignedVendorName.charAt(0) : '?'}
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-text-secondary truncate max-w-[120px]">{lead.assignedVendorName || 'Unassigned'}</span>
                                                                    </div>
                                                                    <button className="text-text-secondary hover:text-text-primary transition-colors">
                                                                        <MoreVertical size={14} />
                                                                    </button>
                                                                </div>
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
                    ) : (
                        <div className="space-y-6">
                            {/* List View Stages Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                                {PIPELINE_STAGES.map(stage => (
                                    <button
                                        key={stage}
                                        onClick={() => { setSelectedStage(stage); setSelectedLeads([]) }}
                                        className={`p-4 rounded-[1.5rem] border text-left transition-all duration-500 overflow-hidden relative group/btn ${selectedStage === stage ? 'bg-electric-blue text-white shadow-glow-md shadow-electric-blue/20 border-electric-blue/40 scale-105' : 'bg-glass-surface/20 border-glass-border/30 text-text-secondary hover:bg-white/5'}`}
                                    >
                                        <div className="relative z-10 flex flex-col gap-2">
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${selectedStage === stage ? 'text-white/80' : 'text-text-secondary/60'}`}>{stage}</span>
                                            <span className="text-xl font-black">{leadsByStage[stage]?.length || 0}</span>
                                        </div>
                                        {selectedStage === stage && <div className="absolute -right-2 -bottom-2 opacity-20"><Zap size={48} className="rotate-12" /></div>}
                                    </button>
                                ))}
                            </div>

                            <Card className="!p-0 overflow-hidden relative border-none">
                                {selectedLeads.length > 0 && (
                                    <div className="p-4 bg-neon-cyan text-white flex flex-wrap items-center gap-6 relative z-10 animate-fade-in">
                                        <span className="text-sm font-black flex items-center gap-2"><Zap size={16} /> {selectedLeads.length} Leads Selected</span>
                                        <div className="flex items-center gap-3">
                                            <select value={bulkStage} onChange={e => setBulkStage(e.target.value)} className="bg-white/10 border-white/20 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 transition-all">
                                                <option value="" className="text-gray-900">Move to stage...</option>
                                                {PIPELINE_STAGES.map(s => <option key={s} value={s} className="text-gray-900">{s}</option>)}
                                            </select>
                                            <button onClick={() => handleBulkAction('changeStage', bulkStage)} disabled={!bulkStage} className="px-5 py-2 bg-white text-neon-cyan font-black text-xs rounded-xl hover:scale-105 transition-transform disabled:opacity-50">Apply</button>
                                        </div>
                                        <button onClick={() => setSelectedLeads([])} className="ml-auto text-xs font-black uppercase tracking-widest hover:underline opacity-80">Cancel</button>
                                    </div>
                                )}

                                <div className="overflow-x-auto min-h-[400px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="px-6 py-5 w-10">
                                                    <input type="checkbox" ref={headerCheckboxRef} onChange={e => setSelectedLeads(e.target.checked ? sortedLeads.map(l => l.id) : [])} className="w-4 h-4 rounded border-glass-border/50 bg-night-sky/60 text-electric-blue focus:ring-electric-blue transition-all" />
                                                </th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Lead Information</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary/60 text-center">Context</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Assigned Partner</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary/60 text-right">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {sortedLeads.length > 0 ? sortedLeads.map((lead) => (
                                                <tr key={lead.id} className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedLeads.includes(lead.id) ? 'bg-electric-blue/[0.03]' : ''}`}>
                                                    <td className="px-6 py-5">
                                                        <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={(e) => setSelectedLeads(prev => e.target.checked ? [...prev, lead.id] : prev.filter(id => id !== lead.id))} className="w-4 h-4 rounded border-glass-border/50 bg-night-sky/60 text-electric-blue focus:ring-electric-blue transition-all" onClick={e => e.stopPropagation()} />
                                                    </td>
                                                    <td className="px-6 py-5" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-glass-surface to-night-sky border border-white/5 flex items-center justify-center font-black text-neon-cyan shadow-lg">
                                                                {lead.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-text-primary group-hover:text-neon-cyan transition-colors">{lead.name || 'N/A'}</div>
                                                                <div className="text-[11px] text-text-secondary mt-0.5 font-medium">{lead.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${getStatusStyles(lead.scoreStatus)}`}>{lead.scoreStatus}</span>
                                                            <span className="text-[10px] font-bold text-text-secondary/60 flex items-center gap-1"><Clock size={10} /> {new Date(lead.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="h-8 w-8 rounded-xl bg-bright-violet/10 border border-bright-violet/20 flex items-center justify-center text-[11px] font-black text-bright-violet">
                                                                {lead.assignedVendorName ? lead.assignedVendorName.charAt(0) : '?'}
                                                            </div>
                                                            <span className="text-xs font-bold text-text-primary">{lead.assignedVendorName || 'Unassigned'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                                        <div className="text-[11px] font-black text-text-primary opacity-80 uppercase tracking-tighter">{lead.productType}</div>
                                                        <div className="text-[10px] font-bold text-neon-cyan mt-1">{lead.phone}</div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={5} className="py-20 text-center text-text-secondary/40 font-black uppercase tracking-[0.2em] text-sm">No Entries Found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </DragDropContext>
            )}
        </div>
    );
};

export default LeadsListPage;