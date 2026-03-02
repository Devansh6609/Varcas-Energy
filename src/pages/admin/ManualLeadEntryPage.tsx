import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createManualLead, getVendors } from '../../service/adminService';
import { User } from '../../types';
import { UserPlus, Settings2, FileText, UploadCloud, FilePlus2 } from 'lucide-react';

interface FormDataState {
    name: string;
    fatherName: string;
    phone: string;
    district: string;
    tehsil: string;
    village: string;
    hp: string;
    connectionType: string;
    productType: string;
    assignedVendorId: string;
    meterSerialNo: string;
    panelSerialNo: string;
}

const ManualLeadEntryPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [vendors, setVendors] = useState<User[]>([]);

    const [basicProfileFile, setBasicProfileFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<FormDataState>({
        name: '',
        fatherName: '',
        phone: '',
        district: '',
        tehsil: '',
        village: '',
        hp: '',
        connectionType: '',
        productType: 'pump',
        assignedVendorId: '',
        meterSerialNo: '',
        panelSerialNo: ''
    });

    useEffect(() => {
        if (user && user.role === 'Master') {
            fetchVendors();
        }
    }, [user]);

    const fetchVendors = async () => {
        try {
            const data = await getVendors();
            setVendors(data);
        } catch (error) {
            console.error("Failed to load vendors", error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBasicProfileFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const submitData = new FormData();
            // Append all details
            Object.entries(formData).forEach(([key, value]) => {
                submitData.append(key, value);
            });

            if (basicProfileFile) {
                submitData.append('basicProfile', basicProfileFile);
            }

            await createManualLead(submitData);

            addToast('Offline case created successfully!', 'success');
            // Reset form or navigate
            setTimeout(() => {
                navigate('/admin/leads');
            }, 2000);

        } catch (error: any) {
            console.error("Submission Error:", error);
            addToast(error.message || 'Failed to create case. Check mobile number uniqueness.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full p-3 rounded-xl border border-glass-border/30 bg-night-sky/50 text-text-primary text-sm focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all placeholder:text-text-secondary/40 shadow-inner shadow-black/20";
    const labelClasses = "block text-[10px] font-black text-text-secondary/80 mb-2 uppercase tracking-widest";

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-24">

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <FilePlus2 size={12} className="fill-neon-cyan" />
                            Data Entry
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                        Offline <span className="text-neon-cyan">Entry</span>
                    </h1>
                    <p className="text-text-secondary/60 text-sm font-bold">
                        Manually digitize offline cases and assign them to the pipeline.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 shadow-glow-sm shadow-neon-cyan/5 p-6 sm:p-8 space-y-8 sm:space-y-10 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                {/* Section 1: Basic Info */}
                <section className="space-y-6 relative z-10">
                    <h2 className="text-xl font-black text-text-primary border-b border-glass-border/20 pb-4 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                            <UserPlus size={20} />
                        </div>
                        Core Contact Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                        {/* Name */}
                        <div>
                            <label className={labelClasses}>Customer Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Enter full name"
                            />
                        </div>
                        {/* Father Name */}
                        <div>
                            <label className={labelClasses}>Father's Name</label>
                            <input
                                type="text"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Father's name"
                            />
                        </div>
                        {/* Mobile */}
                        <div>
                            <label className={labelClasses}>Mobile Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                pattern="[0-9]{10}"
                                title="10 digit mobile number"
                                value={formData.phone}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="10-digit number"
                            />
                        </div>
                        {/* HP */}
                        <div>
                            <label className={labelClasses}>Horsepower (HP)</label>
                            <input
                                type="text"
                                name="hp"
                                value={formData.hp}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="e.g. 5HP, 7.5HP"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                        {/* District */}
                        <div>
                            <label className={labelClasses}>District</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="District"
                            />
                        </div>
                        {/* Tehsil */}
                        <div>
                            <label className={labelClasses}>Tehsil</label>
                            <input
                                type="text"
                                name="tehsil"
                                value={formData.tehsil}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Tehsil"
                            />
                        </div>
                        {/* Village */}
                        <div className="col-span-2 sm:col-span-1">
                            <label className={labelClasses}>Village</label>
                            <input
                                type="text"
                                name="village"
                                value={formData.village}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Village"
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Technical & Assignment */}
                <section className="space-y-6 relative z-10">
                    <h2 className="text-xl font-black text-text-primary border-b border-glass-border/20 pb-4 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                            <Settings2 size={20} />
                        </div>
                        Technical Specifications
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                        {/* Connection Type */}
                        <div>
                            <label htmlFor="connectionType" className={labelClasses}>Electric Connection Type</label>
                            <select
                                id="connectionType"
                                name="connectionType"
                                value={formData.connectionType}
                                onChange={handleChange}
                                className={inputClasses}
                            >
                                <option value="">Select Connection Type</option>
                                <option value="Single Phase">Single Phase</option>
                                <option value="Three Phase">Three Phase</option>
                                <option value="None">None / New Connection</option>
                            </select>
                        </div>
                        {/* Product Type (Fixed to Solar Pump) */}
                        <div className="hidden">
                            <input type="hidden" name="productType" value="pump" />
                        </div>

                        {/* Master Admin: Vendor Assignment */}
                        {user && user.role === 'Master' && (
                            <div className="col-span-1">
                                <label htmlFor="assignedVendorId" className={labelClasses}>Assign Vendor</label>
                                <select
                                    id="assignedVendorId"
                                    name="assignedVendorId"
                                    value={formData.assignedVendorId}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="">Select Vendor (Optional)</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} ({v.district})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 3: Document Upload */}
                <section className="space-y-6 relative z-10">
                    <h2 className="text-xl font-black text-text-primary border-b border-glass-border/20 pb-4 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-bright-violet/10 text-bright-violet border border-bright-violet/20">
                            <FileText size={20} />
                        </div>
                        Documentation
                    </h2>
                    <div className="p-8 border-2 border-dashed border-glass-border/30 rounded-2xl bg-night-sky/30 hover:border-bright-violet/50 hover:bg-bright-violet/5 transition-all group relative overflow-hidden">

                        <label htmlFor="basicProfile" className="flex flex-col items-center justify-center text-center cursor-pointer relative z-10">
                            <div className="mb-4 p-4 rounded-full bg-glass-surface/50 border border-glass-border/30 group-hover:scale-110 group-hover:bg-bright-violet/10 transition-all duration-300">
                                <UploadCloud size={32} className="text-text-secondary group-hover:text-bright-violet transition-colors" />
                            </div>
                            <span className="block text-sm sm:text-base font-black text-text-primary mb-2">
                                Upload Basic Profile PDF <span className="text-bright-violet">*</span>
                            </span>
                            <span className="block text-xs text-text-secondary/60 mb-6 font-bold max-w-sm">
                                Drag and drop your scanned NTP/Application Form here, or click to browse files.
                            </span>
                            <input
                                id="basicProfile"
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="block w-full max-w-xs text-sm text-text-secondary/60
                                    file:mr-4 file:py-2 file:px-6
                                    file:rounded-xl file:border-0
                                    file:text-sm file:font-black
                                    file:bg-gradient-to-r file:from-bright-violet file:to-neon-cyan file:text-night-sky
                                    hover:file:shadow-glow-sm hover:file:shadow-bright-violet/30 cursor-pointer transition-all mx-auto"
                            />
                        </label>
                    </div>
                </section>

                <div className="flex gap-4 pt-8 border-t border-glass-border/20 relative z-10">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/leads')}
                        className="flex-1 py-4 rounded-xl border border-glass-border/30 text-text-secondary hover:text-white hover:bg-white/5 transition-all text-sm font-black tracking-wide"
                    >
                        CANCEL
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex-[2] py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black tracking-wide shadow-glow-sm shadow-neon-cyan/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'CREATING CASE...' : 'CREATE OFFLINE CASE'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManualLeadEntryPage;
