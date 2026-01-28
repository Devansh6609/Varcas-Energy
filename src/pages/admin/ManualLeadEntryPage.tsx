import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createManualLead, getVendors } from '../../service/adminService';
import { User } from '../../types';

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

    const inputClasses = "w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all placeholder:text-gray-400";
    const labelClasses = "block text-[10px] sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide";

    return (
        <div className="p-2 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-3 sm:space-y-6">
            <header className="mb-2 sm:mb-4 px-1">
                <h1 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Offline Entry</h1>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">Manually add offline NTP cases.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700 p-3 sm:p-6 space-y-4 sm:space-y-6">

                {/* Section 1: Basic Info */}
                <section className="space-y-3 sm:space-y-4">
                    <h2 className="text-sm sm:text-xl font-bold text-primary-green border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                        <span className="bg-primary-green/10 p-1 rounded-lg">👤</span> Core Customer Details
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
                <section className="space-y-3 sm:space-y-4">
                    <h2 className="text-sm sm:text-xl font-bold text-primary-green border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                        <span className="bg-primary-green/10 p-1 rounded-lg">⚡</span> Technical & Assignment
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
                <section className="space-y-3 sm:space-y-4">
                    <h2 className="text-sm sm:text-xl font-bold text-primary-green border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                        <span className="bg-primary-green/10 p-1 rounded-lg">📄</span> Documents
                    </h2>
                    <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-black/20 hover:border-primary-green transition-colors">
                        <label htmlFor="basicProfile" className="block text-center cursor-pointer">
                            <div className="mb-2">
                                <span className="bg-primary-green/10 p-2 rounded-full inline-block">
                                    {/* Icon placeholder if needed, or just text */}
                                    📂
                                </span>
                            </div>
                            <span className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Upload Basic Profile PDF *
                            </span>
                            <span className="block text-[10px] text-gray-400 mb-3">Scanned NTP/Application Form</span>
                            <input
                                id="basicProfile"
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="block w-full text-xs text-gray-500
                                    file:mr-4 file:py-1.5 file:px-3 sm:file:py-2 sm:file:px-4
                                    file:rounded-full file:border-0
                                    file:text-xs file:font-semibold
                                    file:bg-primary-green file:text-white
                                    hover:file:bg-green-600 cursor-pointer mx-auto max-w-xs"
                            />
                        </label>
                    </div>
                </section>

                <div className="flex gap-3 pt-2 sm:pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/leads')}
                        className="flex-1 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex-[2] py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg shadow-green-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating Case...' : 'Create Offline Case'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManualLeadEntryPage;
