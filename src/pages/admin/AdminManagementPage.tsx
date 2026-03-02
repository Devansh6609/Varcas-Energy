import React, { useState, useEffect } from 'react';
import { getMasterAdmins } from '../../service/adminService';
import { User } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import CreateAdminModal from '../../components/admin/CreateAdminModal';
import DeleteUserConfirmationModal from '../../components/admin/DeleteUserConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, UserCog, Mail, ShieldCheck, Trash2 } from 'lucide-react';

const AdminManagementPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await getMasterAdmins();
            setAdmins(data);
        } catch (err) {
            setError('Failed to load admin accounts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAdminCreated = () => {
        setIsCreateModalOpen(false);
        fetchAdmins(); // Refresh the list after creation
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-24">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-error-red/10 border border-error-red/20 text-error-red text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert size={12} className="text-error-red" />
                            System Access
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                        Admin <span className="text-error-red">Management</span>
                    </h1>
                    <p className="text-text-secondary/60 text-sm font-bold">
                        Control master access and system administrators.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-error-red/80 to-error-red text-white font-black tracking-wide shadow-glow-sm shadow-error-red/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <UserCog size={18} />
                    ADD ADMIN
                </button>
            </div>

            <div className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 shadow-glow-sm shadow-error-red/5 overflow-hidden relative">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-error-red/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                {loading && (
                    <div className="flex justify-center p-12 relative z-10">
                        <LoadingSpinner size="lg" className="text-error-red" />
                    </div>
                )}

                {!loading && !error && (
                    <div className="overflow-x-auto relative z-10 p-2 sm:p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-glass-border/20 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest">Administrator</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest hidden sm:table-cell">Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest hidden md:table-cell">Role Level</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass-border/10">
                                {admins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-error-red/10 border border-error-red/20 flex items-center justify-center text-error-red font-bold shadow-inset">
                                                    {admin.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-primary">{admin.name}</div>
                                                    {admin.id === currentUser?.id && (
                                                        <div className="text-[10px] text-error-red/60 uppercase tracking-wider font-bold">You</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-2 text-text-secondary text-sm">
                                                <Mail size={14} className="opacity-50" />
                                                {admin.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-error-red/20 to-transparent border border-error-red/20 text-error-red shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                                <ShieldCheck size={14} className="mr-1.5" />
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setUserToDelete(admin)}
                                                className="p-2 rounded-lg text-text-secondary opacity-0 group-hover:opacity-100 hover:bg-error-red/10 hover:text-error-red transition-all disabled:opacity-0"
                                                disabled={admin.id === currentUser?.id}
                                                title={admin.id === currentUser?.id ? "You cannot delete your own account." : "Delete this admin"}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {error && !loading && <p className="text-error-red p-6 text-center font-bold bg-error-red/5 relative z-10">{error}</p>}
            </div>

            {isCreateModalOpen && (
                <CreateAdminModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onAdminCreated={handleAdminCreated}
                />
            )}

            {userToDelete && (
                <DeleteUserConfirmationModal
                    userToDelete={userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onDeleteSuccess={() => {
                        setUserToDelete(null);
                        fetchAdmins(); // Refresh list
                    }}
                />
            )}
        </div>
    );
};

export default AdminManagementPage;