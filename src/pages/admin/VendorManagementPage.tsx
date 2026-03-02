import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getVendors, getStates, getDistricts, createVendor } from '../../service/adminService';
import { User } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import DeleteUserConfirmationModal from '../../components/admin/DeleteUserConfirmationModal';
import { Users, Search, UserPlus, Trash2, MapPin, Mail, ShieldCheck } from 'lucide-react';

const VendorManagementPage: React.FC = () => {
    const [vendors, setVendors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [newVendor, setNewVendor] = useState({ name: '', email: '', password: '', state: '', district: '' });
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await getVendors();
            setVendors(data);
        } catch (err) {
            setError('Failed to load vendors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
        getStates().then(setStates).catch(() => setError("Could not load states"));
    }, []);

    useEffect(() => {
        if (newVendor.state) {
            getDistricts(newVendor.state).then(setDistricts).catch(() => setError("Could not load districts"));
        } else {
            setDistricts([]);
        }
    }, [newVendor.state]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewVendor(prev => ({ ...prev, [name]: value }));
        if (name === 'state') {
            setNewVendor(prev => ({ ...prev, district: '' }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            await createVendor(newVendor);
            setIsCreateModalOpen(false);
            setNewVendor({ name: '', email: '', password: '', state: '', district: '' });
            await fetchVendors(); // Refresh the list
        } catch (err: any) {
            setError(err.message || 'Failed to create vendor.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor =>
            vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.district?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vendors, searchTerm]);

    const modalRoot = document.getElementById('modal-root');
    const modalInputClass = "w-full p-3 rounded-xl border border-glass-border/30 bg-night-sky/50 text-text-primary text-sm focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue outline-none transition-all placeholder:text-text-secondary/40 shadow-inner shadow-black/20";
    const modalLabelClass = "block text-[10px] font-black text-text-secondary/80 mb-2 uppercase tracking-widest";

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-24">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={12} className="text-electric-blue" />
                            Directory
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                        Vendor <span className="text-electric-blue">Management</span>
                    </h1>
                    <p className="text-text-secondary/60 text-sm font-bold">
                        Manage vendor accounts, operational regions, and system access.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-accent-blue text-white font-black tracking-wide shadow-glow-sm shadow-electric-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <UserPlus size={18} />
                    ADD VENDOR
                </button>
            </div>

            <div className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 shadow-glow-sm shadow-electric-blue/5 overflow-hidden">
                <div className="p-6 border-b border-glass-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-night-sky/50 border border-glass-border/30 rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue outline-none transition-all placeholder:text-text-secondary/40"
                        />
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center p-12">
                        <LoadingSpinner size="lg" className="text-electric-blue" />
                    </div>
                )}

                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-glass-border/20 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest hidden sm:table-cell">Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest hidden md:table-cell">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass-border/10">
                                {filteredVendors.map(vendor => (
                                    <tr key={vendor.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue font-bold">
                                                    {vendor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-bold text-text-primary">{vendor.name}</div>
                                                <div className="text-xs text-text-secondary sm:hidden mt-0.5">{vendor.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-2 text-text-secondary text-sm">
                                                <Mail size={14} className="opacity-50" />
                                                {vendor.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-text-secondary text-sm">
                                                <MapPin size={14} className="opacity-50" />
                                                {vendor.district}, {vendor.state}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setUserToDelete(vendor)}
                                                className="p-2 rounded-lg text-text-secondary opacity-0 group-hover:opacity-100 hover:bg-error-red/10 hover:text-error-red transition-all"
                                                title="Delete Vendor"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredVendors.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                                            No vendors found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {error && !loading && <p className="text-error-red p-6 text-center font-bold bg-error-red/5">{error}</p>}
            </div>

            {isCreateModalOpen && modalRoot && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-glass-surface/90 backdrop-blur-2xl border border-glass-border/30 p-8 rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden">
                        {/* Modal Glow */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-electric-blue/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <h3 className="text-2xl font-black mb-8 text-text-primary flex items-center gap-3 relative z-10">
                            <span className="p-2 rounded-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                                <UserPlus size={20} />
                            </span>
                            Create New Vendor
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            <div>
                                <label htmlFor="name" className={modalLabelClass}>Full Name *</label>
                                <input id="name" type="text" name="name" placeholder="Vendor's full name" value={newVendor.name} onChange={handleInputChange} required className={modalInputClass} />
                            </div>
                            <div>
                                <label htmlFor="email" className={modalLabelClass}>Email Address *</label>
                                <input id="email" type="email" name="email" placeholder="vendor@domain.com" value={newVendor.email} onChange={handleInputChange} required className={modalInputClass} />
                            </div>
                            <div>
                                <label htmlFor="password" className={modalLabelClass}>Password *</label>
                                <input id="password" type="password" name="password" placeholder="Create a strong password" value={newVendor.password} onChange={handleInputChange} required className={modalInputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="state" className={modalLabelClass}>State *</label>
                                    <select id="state" name="state" value={newVendor.state} onChange={handleInputChange} required className={modalInputClass}>
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="district" className={modalLabelClass}>District *</label>
                                    <select id="district" name="district" value={newVendor.district} onChange={handleInputChange} required disabled={!newVendor.state} className={`${modalInputClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                        <option value="">Select District</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            {error && <p className="text-error-red text-sm font-bold bg-error-red/10 p-3 rounded-xl border border-error-red/20">{error}</p>}

                            <div className="flex gap-4 pt-6 mt-6 border-t border-glass-border/20">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 px-4 border border-glass-border/30 text-text-secondary font-black rounded-xl hover:bg-white/5 hover:text-white transition-all text-sm tracking-wide">
                                    CANCEL
                                </button>
                                <button type="submit" disabled={isSaving} className="flex-[2] py-3 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-electric-blue to-accent-blue text-white font-black rounded-xl shadow-glow-sm shadow-electric-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm tracking-wide">
                                    {isSaving ? (
                                        <>
                                            <LoadingSpinner size="sm" className="!w-4 !h-4 text-white" />
                                            SAVING...
                                        </>
                                    ) : (
                                        'CREATE VENDOR'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                modalRoot
            )}

            {userToDelete && (
                <DeleteUserConfirmationModal
                    userToDelete={userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onDeleteSuccess={() => {
                        setUserToDelete(null);
                        fetchVendors(); // Refresh list after successful deletion
                    }}
                />
            )}
        </div>
    );
};

export default VendorManagementPage;