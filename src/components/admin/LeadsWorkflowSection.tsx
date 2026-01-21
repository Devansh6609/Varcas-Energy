import React, { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, ChevronRight, Lock, LayoutDashboard, CreditCard,
    Cpu, ClipboardCheck, Building2, FileText, Settings, Truck, Flag, Clock
} from 'lucide-react';
import { Lead } from '../../types';
import { updateLead } from '../../service/adminService';
import { useToast } from '../../contexts/ToastContext';

interface LeadsWorkflowSectionProps {
    lead: Lead;
    onUpdate: (updatedLead: Lead) => void;
}

const STEPS = [
    { id: 1, title: 'Application Approval', icon: LayoutDashboard },
    { id: 2, title: 'Payment Status', icon: CreditCard },
    { id: 3, title: 'Allotment (Alloy)', icon: Cpu },
    { id: 4, title: 'Site Survey', icon: ClipboardCheck },
    { id: 5, title: 'Bank Account', icon: Building2 },
    { id: 6, title: 'Work Order (NTP)', icon: FileText },
    { id: 7, title: 'AIF Status', icon: Settings },
    { id: 8, title: 'CIF Status', icon: CheckCircle },
    { id: 9, title: 'Material Dispatch', icon: Truck },
    { id: 10, title: 'Work Completion', icon: Flag },
];

export const LeadsWorkflowSection: React.FC<LeadsWorkflowSectionProps> = ({ lead, onUpdate }) => {
    const { addToast } = useToast();
    const [openStep, setOpenStep] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // --- Completion Logic ---
    const stepsStatus = {
        1: lead.approvalStatus === 'Approved',
        2: lead.paymentStatus === 'Complete',
        3: lead.allotmentStatus === 'Received',
        4: lead.surveyStatus === 'Completed',
        5: lead.bankAccountOpen === true,
        6: lead.ntpStatus === 'Received',
        7: lead.aifStatus === 'Done',
        8: lead.cifStatus === true,
        9: lead.workStatus === 'Material_Dispatched' || lead.workStatus === 'Work_Complete',
        10: lead.workStatus === 'Work_Complete'
    };

    // Determine the first active/unlocked step to open initially
    useEffect(() => {
        let firstIncomplete = 1;
        for (let i = 1; i <= 10; i++) {
            // @ts-ignore
            if (!stepsStatus[i]) {
                firstIncomplete = i;
                break;
            }
        }
        setOpenStep(firstIncomplete);
    }, [lead.id]);

    // Helper to determine step state
    const getStepState = (stepNum: number) => {
        // @ts-ignore
        if (stepsStatus[stepNum]) return 'completed';
        // Previous step must be complete to unlock
        // @ts-ignore
        if (stepNum === 1 || stepsStatus[stepNum - 1]) return 'active';
        return 'locked';
    };

    const handleUpdate = async (field: string, value: any, fileKey?: string, file?: File) => {
        if (loading) return;
        setLoading(true);

        const previousLead = { ...lead };
        const optimisticLead = { ...lead, [field]: value };
        onUpdate(optimisticLead);

        try {
            const formData = new FormData();
            formData.append(field, value);
            if (file && fileKey) {
                formData.append(fileKey, file);
            }

            const updated = await updateLead(lead.id, formData);
            onUpdate(updated);
            addToast('Workflow updated successfully', 'success');
        } catch (error: any) {
            console.error("Update failed:", error);
            onUpdate(previousLead);
            addToast(error.message || 'Failed to update workflow', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (stepId: number) => {
        switch (stepId) {
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-200">Current Status</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{lead.approvalStatus || 'Pending'}</p>
                        </div>
                        <div className="flex gap-4">
                            <button disabled={loading} onClick={() => handleUpdate('approvalStatus', 'Approved')} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">Approve Application</button>
                            <button disabled={loading} onClick={() => handleUpdate('approvalStatus', 'Rejected')} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">Reject Application</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Status</label>
                            <select
                                aria-label="Payment Status"
                                disabled={loading}
                                value={lead.paymentStatus || ''}
                                onChange={(e) => handleUpdate('paymentStatus', e.target.value)}
                                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-green outline-none transition-all disabled:opacity-50"
                            >
                                <option value="">Select Status</option>
                                <option value="Complete">Payment Complete</option>
                                <option value="Hold">Payment Hold</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Payment Slip</label>
                            <div className="relative">
                                <input type="file" aria-label="Upload Payment Slip" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('paymentStatus', lead.paymentStatus || 'Complete', 'paymentSlip', e.target.files[0]);
                                }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <button disabled={loading} onClick={() => handleUpdate('allotmentStatus', 'Received')} className={`p-6 rounded-xl border-2 transition-all ${lead.allotmentStatus === 'Received' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <Cpu className="w-8 h-8 mb-3 mx-auto" />
                                <span className="block text-center font-semibold">Received</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('allotmentStatus', 'Pending')} className={`p-6 rounded-xl border-2 transition-all ${lead.allotmentStatus === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-8 h-8 mb-3 mx-auto" />
                                <span className="block text-center font-semibold">Pending</span>
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <button disabled={loading} onClick={() => handleUpdate('surveyStatus', 'Completed')} className={`p-6 rounded-xl border-2 transition-all ${lead.surveyStatus === 'Completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <ClipboardCheck className="w-8 h-8 mb-3 mx-auto" />
                                <span className="block text-center font-semibold">Survey Completed</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('surveyStatus', 'Pending')} className={`p-6 rounded-xl border-2 transition-all ${lead.surveyStatus === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-8 h-8 mb-3 mx-auto" />
                                <span className="block text-center font-semibold">Pending Survey</span>
                            </button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Is Bank Account Open?</span>
                            <div className="flex gap-2">
                                <button disabled={loading} onClick={() => handleUpdate('bankAccountOpen', true)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${lead.bankAccountOpen ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>Yes</button>
                                <button disabled={loading} onClick={() => handleUpdate('bankAccountOpen', false)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${lead.bankAccountOpen === false ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>No</button>
                            </div>
                        </div>
                        <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <label className="block text-center cursor-pointer">
                                <span className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Passbook Copy</span>
                                <input type="file" aria-label="Upload Passbook" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('bankAccountOpen', lead.bankAccountOpen, 'passbook', e.target.files[0]);
                                }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </label>
                        </div>
                    </div>
                );
            case 6: // NTP
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
                             <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Work Order (NTP) Status</h4>
                             <div className="flex gap-4">
                                <button disabled={loading} onClick={() => handleUpdate('ntpStatus', 'Received')} className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${lead.ntpStatus === 'Received' ? 'border-green-500 bg-green-500 text-white shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
                                    Received
                                </button>
                                <button disabled={loading} onClick={() => handleUpdate('ntpStatus', 'Not_Received')} className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${lead.ntpStatus === 'Not_Received' ? 'border-red-500 bg-red-500 text-white shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-red-400'}`}>
                                    Not Received
                                </button>
                             </div>
                        </div>
                    </div>
                );
            case 7: // AIF
                 return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <button disabled={loading} onClick={() => handleUpdate('aifStatus', 'Done')} className={`p-6 rounded-xl border-2 transition-all ${lead.aifStatus === 'Done' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <CheckCircle className="w-8 h-8 mb-3 mx-auto" />
                                <span className="block text-center font-semibold">Done</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('aifStatus', 'Pending')} className={`p-6 rounded-xl border-2 transition-all ${lead.aifStatus === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-8 h-8 mb-3 mx-auto" />
                                <span className="block text-center font-semibold">Pending</span>
                            </button>
                        </div>
                    </div>
                );
            case 8: // CIF
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Is CIF Approved?</span>
                            <div className="flex gap-3">
                                <button disabled={loading} onClick={() => handleUpdate('cifStatus', true)} className={`px-6 py-3 rounded-lg font-bold transition-all ${lead.cifStatus ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>YES</button>
                                <button disabled={loading} onClick={() => handleUpdate('cifStatus', false)} className={`px-6 py-3 rounded-lg font-bold transition-all ${lead.cifStatus === false ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>NO</button>
                            </div>
                        </div>
                    </div>
                );
            case 9: // Material
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Motor Serial No</label>
                                <input type="text" aria-label="Motor Serial Number" disabled={loading} defaultValue={lead.meterSerialNo || ''} onBlur={(e) => handleUpdate('meterSerialNo', e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-green outline-none disabled:opacity-50" placeholder="Enter Motor No" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Panel Serial No</label>
                                <input type="text" aria-label="Panel Serial Number" disabled={loading} defaultValue={lead.panelSerialNo || ''} onBlur={(e) => handleUpdate('panelSerialNo', e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-green outline-none disabled:opacity-50" placeholder="Enter Panel No" />
                            </div>
                        </div>
                        <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                             <label className="block text-center cursor-pointer">
                                <span className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Structure Photo</span>
                                <input type="file" aria-label="Upload Structure Photo" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('workStatus', 'Material_Dispatched', 'structurePic', e.target.files[0]);
                                }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50" />
                            </label>
                        </div>
                        <button disabled={loading} onClick={() => handleUpdate('workStatus', 'Material_Dispatched')} className="w-full py-4 bg-primary-green text-white font-bold rounded-xl shadow-lg hover:bg-primary-green-hover transition-all transform hover:scale-[1.01] disabled:opacity-50">Mark Materials Dispatched</button>
                    </div>
                );
            case 10: // Completion
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-green-50 dark:bg-green-900/10 p-8 rounded-2xl border border-green-100 dark:border-green-800 text-center">
                            <Flag className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Final Work Completion</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Upload the final photo with customer to complete the project.</p>
                            
                            <div className="mb-6 max-w-md mx-auto">
                                <input type="file" aria-label="Upload Customer Project Photo" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('workStatus', 'Work_Complete', 'customerPic', e.target.files[0]);
                                }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 disabled:opacity-50" />
                            </div>

                            <button disabled={loading} onClick={() => handleUpdate('workStatus', 'Work_Complete')} className="px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50">
                                Complete Project
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Left Sidebar: Stepper */}
            <div className="lg:col-span-4 space-y-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">Workflow Steps</h3>
                <div className="bg-white dark:bg-secondary-background rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                    {STEPS.map((step) => {
                        const status = getStepState(step.id);
                        const isActive = openStep === step.id;
                        const StepIcon = step.icon;

                        return (
                            <div
                                key={step.id}
                                onClick={() => status !== 'locked' && setOpenStep(step.id)}
                                className={`
                                    relative flex items-center p-4 cursor-pointer transition-all duration-200 border-b border-gray-50 dark:border-gray-800 last:border-0
                                    ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                                    ${status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />}
                                
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm
                                    ${status === 'completed' ? 'bg-green-100 text-green-600' : ''}
                                    ${status === 'active' ? 'bg-blue-100 text-blue-600' : ''}
                                    ${status === 'locked' ? 'bg-gray-100 text-gray-400' : ''}
                                `}>
                                    {status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                                </div>

                                <div className="flex-1">
                                    <h4 className={`text-sm font-semibold ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{step.title}</h4>
                                    <p className="text-xs text-gray-400 capitalize">{status}</p>
                                </div>

                                {status === 'locked' && <Lock className="w-4 h-4 text-gray-300" />}
                                {status !== 'locked' && <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isActive ? 'rotate-90' : ''}`} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Panel: Content Form */}
            <div className="lg:col-span-8">
                <div className="bg-white dark:bg-secondary-background rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 p-6 h-full relative overflow-hidden">
                     {/* Header for Active Step */}
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Step {openStep} of 10</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {STEPS.find(s => s.id === openStep)?.title}
                            </h2>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                             {(() => {
                                 const Icon = STEPS.find(s => s.id === openStep)?.icon || LayoutDashboard;
                                 return <Icon className="w-6 h-6" />;
                             })()}
                        </div>
                     </div>

                     {/* Content */}
                     <div className="min-h-[400px]">
                        {openStep ? renderStepContent(openStep) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <LayoutDashboard className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a step to view details</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};
