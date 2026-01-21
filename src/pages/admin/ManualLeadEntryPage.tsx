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

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Offline Entry</h1>
                <p className="text-gray-600 dark:text-gray-400">Manually add offline NTP cases to the system.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-8 border border-gray-100 dark:border-gray-700">

                {/* Section 1: Basic Info */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-primary-green border-b border-gray-200 dark:border-gray-700 pb-2">
                        1. Core Customer Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="Enter full name"
                            />
                        </div>
                        {/* Father Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Father's Name</label>
                            <input
                                type="text"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="Father's name"
                            />
                        </div>
                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                pattern="[0-9]{10}"
                                title="10 digit mobile number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="10-digit number"
                            />
                        </div>
                        {/* HP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horsepower (HP)</label>
                            <input
                                type="text"
                                name="hp"
                                value={formData.hp}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="e.g. 5HP, 7.5HP"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* District */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="District"
                            />
                        </div>
                        {/* Tehsil */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tehsil</label>
                            <input
                                type="text"
                                name="tehsil"
                                value={formData.tehsil}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="Tehsil"
                            />
                        </div>
                        {/* Village */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village</label>
                            <input
                                type="text"
                                name="village"
                                value={formData.village}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="Village"
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Technical & Assignment */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-primary-green border-b border-gray-200 dark:border-gray-700 pb-2">
                        2. Technical & Assignment
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Connection Type */}
                        <div>
                            <label htmlFor="connectionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Electric Connection Type</label>
                            <select
                                id="connectionType"
                                name="connectionType"
                                value={formData.connectionType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
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
                                <label htmlFor="assignedVendorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Vendor</label>
                                <select
                                    id="assignedVendorId"
                                    name="assignedVendorId"
                                    value={formData.assignedVendorId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
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
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-primary-green border-b border-gray-200 dark:border-gray-700 pb-2">
                        3. Documents
                    </h2>
                    <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-white/5">
                        <label htmlFor="basicProfile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Basic Profile PDF *
                        </label>
                        <input
                            id="basicProfile"
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary-green/10 file:text-primary-green
                                hover:file:bg-primary-green/20"
                        />
                        <p className="mt-1 text-xs text-gray-500">Upload the scanned NTP/Application form.</p>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/leads')}
                        className="px-6 py-2 mr-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-8 py-2 rounded-lg bg-primary-green text-white font-medium shadow-md hover:bg-green-600 transition-all transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating Case...' : 'Create Offline Case'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManualLeadEntryPage;
