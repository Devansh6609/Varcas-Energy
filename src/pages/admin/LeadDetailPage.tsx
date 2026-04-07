import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lead, LeadActivity, LeadDocument, PipelineStage, FormField, User } from '../../types';
import { getLeadDetails, getFormSchema, getVendors, updateLead, addLeadNote, uploadDocument, deleteLead, deleteDocument } from '../../service/adminService';
import { PIPELINE_STAGES } from '../../constants';
import {
    Trash2, ClipboardCheck, Edit2, Save, X, ArrowLeft,
    User as UserIcon, Phone, Mail, MapPin, Calendar,
    Clock, Zap, FileText, Activity, ShieldCheck,
    MoreHorizontal, Download, Trash, Plus, ChevronRight
} from 'lucide-react';
import PipelineTracker from '../../components/admin/PipelineTracker';
import { LeadsWorkflowSection } from '../../components/admin/LeadsWorkflowSection';
import { RooftopWorkflowSection } from '../../components/admin/RooftopWorkflowSection';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/admin/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import { DocumentPreviewModal } from '../../components/ui/DocumentPreviewModal';


const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

const DetailItem: React.FC<{
    label: string,
    value: any,
    isImage?: boolean,
    onView?: (url: string) => void,
    onDelete?: (val: string) => void,
    canDelete?: boolean,
    onUpload?: (file: File) => void
}> = ({ label, value, isImage = false, onView, onDelete, canDelete = false, onUpload }) => (
    <div className="group relative bg-white/5 border border-glass-border/30 rounded-2xl p-4 transition-all duration-500 hover:border-neon-cyan/50 hover:bg-white/[0.08] hover:shadow-glow-sm hover:shadow-neon-cyan/5">
        <dl>
            <dt className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 mb-1">{label}</dt>
            <dd className="text-sm font-bold text-text-primary flex items-center justify-between gap-2 flex-wrap">
                {isImage ? (
                    value ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onView?.(value.startsWith('http') ? value : `${API_BASE_URL}/files/${value}`)}
                                className="bg-neon-cyan/20 text-neon-cyan px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neon-cyan hover:text-white transition-all flex items-center gap-2"
                                type="button"
                                title={`View ${label}`}
                            >
                                <ClipboardCheck size={14} /> View
                            </button>
                            {canDelete && onDelete && (
                                <button
                                    onClick={() => onDelete(value)}
                                    className="text-error-red/60 hover:text-error-red p-2 rounded-xl hover:bg-error-red/10 transition-all"
                                    title={`Delete ${label}`}
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        onUpload && (
                            <label className="cursor-pointer bg-white/5 hover:bg-neon-cyan/10 text-neon-cyan/70 hover:text-neon-cyan px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border border-dashed border-neon-cyan/30">
                                <span>+ Upload</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            onUpload(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                        ) || <span className="text-text-secondary/30 italic font-medium">No File</span>
                    )
                ) : (
                    <span className="truncate max-w-full">{String(value || 'N/A')}</span>
                )}
            </dd>
        </dl>
    </div>
);

const LeadDetailPage: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { triggerUpdate } = useCrmUpdates();
    const [lead, setLead] = useState<Lead | null>(null);
    const [formSchema, setFormSchema] = useState<Map<string, string>>(new Map());
    const [vendors, setVendors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newNote, setNewNote] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);



    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Preview Modal State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    const openPreview = (url: string) => {
        setPreviewUrl(url);
        setIsPreviewOpen(true);
    };

    const handleEditClick = () => {
        setEditData({
            name: lead?.name,
            email: lead?.email,
            phone: lead?.phone,
            productType: lead?.productType,
            fatherName: lead?.fatherName,
            district: lead?.district,
            tehsil: lead?.tehsil,
            village: lead?.village,
            hp: lead?.hp,
            connectionType: lead?.connectionType,
            customFields: { ...(lead?.customFields || {}) }
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({});
    };

    const handleSaveEdit = async () => {
        if (!leadId) return;
        setIsSaving(true);
        try {
            // Prepare update payload
            const updatePayload = {
                name: editData.name,
                email: editData.email,
                phone: editData.phone,
                productType: editData.productType,
                fatherName: editData.fatherName,
                district: editData.district, // This is top-level district for manual leads
                tehsil: editData.tehsil,
                village: editData.village,
                hp: editData.hp,
                connectionType: editData.connectionType,
                customFields: editData.customFields
            };

            const updatedLead = await updateLead(leadId, updatePayload);
            setLead(updatedLead);
            setIsEditing(false);
            alert('Lead details updated successfully!');
        } catch (err) {
            console.error("Failed to update lead details", err);
            alert('Failed to update lead details.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditChange = (field: string, value: any, isCustom: boolean = false) => {
        if (isCustom) {
            setEditData((prev: any) => ({
                ...prev,
                customFields: {
                    ...prev.customFields,
                    [field]: value
                }
            }));
        } else {
            setEditData((prev: any) => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchLeadDetails = async () => {
        if (!leadId) return;
        try {
            setLoading(true);
            const data = await getLeadDetails(leadId);
            setLead(data);

            if (data.productType && data.productType !== 'Contact Inquiry') {
                const schemaData: FormField[] = await getFormSchema(data.productType);
                const schemaMap = new Map();
                schemaData.forEach(field => schemaMap.set(field.name, field.type));
                setFormSchema(schemaMap);
            }
            if (user?.role === 'Master') {
                const vendorData = await getVendors();
                setVendors(vendorData);
            }
        } catch (err) {
            setError('Failed to load lead details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (leadId) {
            fetchLeadDetails();
        }
    }, [leadId, user]);

    // Synchronize editData when lead is updated (e.g. after stage change)
    useEffect(() => {
        if (lead) {
            setEditData({
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                productType: lead.productType,
                fatherName: lead.fatherName,
                district: lead.district,
                tehsil: lead.tehsil,
                village: lead.village,
                hp: lead.hp,
                connectionType: lead.connectionType,
                customFields: typeof lead.customFields === 'string' 
                    ? JSON.parse(lead.customFields || '{}') 
                    : (lead.customFields || {})
            });
        }
    }, [lead]);

    const handleStageChange = async (newStage: PipelineStage) => {
        if (!leadId || !lead) return;
        try {
            const updatedLead = await updateLead(leadId, { pipelineStage: newStage });
            setLead(updatedLead);
        } catch (err) {
            alert('Failed to update stage. Please try again.');
        }
    };

    const handleVendorAssign = async (vendorId: string) => {
        if (!leadId) return;
        try {
            const updatedLead = await updateLead(leadId, { assignedVendorId: vendorId });
            setLead(updatedLead);
        } catch (err) {
            alert('Failed to assign vendor.');
        }
    };

    const handleAddNote = async (e: FormEvent) => {
        e.preventDefault();
        if (!leadId || !newNote.trim()) return;
        setIsSubmittingNote(true);
        try {
            const updatedLead = await addLeadNote(leadId, newNote);
            setLead(updatedLead);
            setNewNote('');
        } catch (err) {
            alert('Failed to add note.');
        } finally {
            setIsSubmittingNote(false);
        }
    };



    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!leadId || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        try {
            const updatedLead = await uploadDocument(leadId, file);
            setLead(updatedLead);
            alert('File uploaded successfully!');
        } catch (err) {
            alert('Failed to upload file.');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSpecificFileUpload = async (key: string, file: File) => {
        if (!leadId) return;
        try {
            const formData = new FormData();
            formData.append(key, file);
            // We also need to send the value, or just the file? 
            // In LeadsWorkflowSection we did: formData.append(field, value); formData.append(fileKey, file);
            // Here we probably just want to update the field with the file.
            // But updateLead expects a partial Lead object or FormData.
            // If we use FormData, the backend should handle file upload for that key.
            // Let's assume the backend handles 'key' as a file upload if it's in the request.
            // Or we might need to match the backend expectation.
            // In LeadsWorkflowSection: handleUpdate('paymentStatus', 'Complete', 'paymentSlip', file)

            // If we are just uploading a file for a specific key without changing other status:
            // Does the backend support just uploading 'paymentSlip' file? 
            // Usually we need to set the field value to the filename AFTER upload?
            // Actually, updateLead with FormData handles it.

            // We'll mimic what we do for generic updates but fully via FormData
            // Since we don't have a status to update, just the file.

            // Checking adminService.ts updateLead signature... it takes (id, data). Data can be FormData.

            const updatedLead = await updateLead(leadId, formData);
            setLead(updatedLead);
            alert(`${key} uploaded successfully!`);
        } catch (err) {
            console.error(err);
            alert(`Failed to upload ${key}.`);
        }
    };



    const handleDeleteDocument = async (docId: string) => {
        if (!leadId || !confirm("Are you sure you want to delete this document?")) return;
        try {
            await deleteDocument(leadId, docId);
            fetchLeadDetails();
            alert('Document deleted successfully.');
        } catch (err) {
            console.error(err);
            alert('Failed to delete document.');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!leadId) return;
        try {
            await deleteLead(leadId);
            setIsDeleteModalOpen(false);
            triggerUpdate();
            navigate('/admin/leads');
        } catch (error) {
            // Re-throw to be caught by the modal's error handling
            throw error;
        }
    };


    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <LoadingSpinner size="lg" />
        </div>
    );
    if (error) return <div className="text-center p-8 text-error-red">{error}</div>;
    if (!lead) return <div className="text-center p-8">Lead not found.</div>;

    return (
        <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto animate-fade-in-up space-y-8">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <Link
                    to="/admin/leads"
                    className="group flex items-center gap-3 text-text-secondary hover:text-neon-cyan transition-all duration-300 font-bold uppercase tracking-widest text-xs"
                >
                    <div className="p-2 rounded-xl bg-white/5 border border-glass-border/30 group-hover:border-neon-cyan group-hover:bg-neon-cyan/10 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    Back to Pipeline
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        title="Download Lead Data"
                        className="p-3 rounded-2xl bg-white/5 border border-glass-border/30 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
                    >
                        <Download size={20} />
                    </button>
                    <button className="px-6 py-3 rounded-2xl bg-neon-cyan text-white font-black uppercase tracking-widest text-xs shadow-glow-sm shadow-neon-cyan/20 hover:scale-105 transition-all">
                        Convert to Project
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column (8/12) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Lead Identity Card */}
                    <Card className="overflow-hidden border-none bg-glass-surface/40 backdrop-blur-3xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent pointer-events-none" />
                        <div className="relative p-8 flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="flex gap-6 items-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] bg-gradient-to-br from-neon-cyan to-electric-blue flex items-center justify-center text-white shadow-glow-md shadow-neon-cyan/20">
                                    <UserIcon size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h1 className="text-3xl font-black text-text-primary tracking-tight">{lead.name}</h1>
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${lead.scoreStatus === 'Hot' ? 'bg-error-red/20 border-error-red/40 text-error-red shadow-glow-sm shadow-error-red/10' :
                                            lead.scoreStatus === 'Warm' ? 'bg-warning-yellow/20 border-warning-yellow/40 text-warning-yellow shadow-glow-sm shadow-warning-yellow/10' :
                                                'bg-electric-blue/20 border-electric-blue/40 text-electric-blue shadow-glow-sm shadow-electric-blue/10'
                                            }`}>
                                            {lead.scoreStatus} • {lead.score} Points
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-text-secondary">
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <Mail size={16} className="text-neon-cyan" />
                                            {lead.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <Phone size={16} className="text-neon-cyan" />
                                            {lead.phone}
                                        </div>
                                        {lead.assignedVendorName && (
                                            <div className="flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-lg bg-white/5 border border-glass-border/30">
                                                <ShieldCheck size={14} className="text-electric-blue" />
                                                {lead.assignedVendorName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 text-right">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                    <Calendar size={14} />
                                    Created {new Date(lead.createdAt).toLocaleDateString()}
                                </div>
                                {user?.role === 'Master' && (
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-error-red/5 border border-error-red/20 text-error-red font-bold text-xs hover:bg-error-red hover:text-white transition-all duration-300"
                                    >
                                        <Trash2 size={14} className="group-hover:animate-bounce" />
                                        Delete Lead
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Sales Pipeline Section */}
                    <Card className="bg-glass-surface/20 border-glass-border/30">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-electric-blue/10 text-electric-blue">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-text-primary tracking-tight">Sales Pipeline</h3>
                                    <p className="text-xs font-bold text-text-secondary flex items-center gap-2">
                                        <Zap size={14} className="text-neon-cyan" />
                                        Track and advance the lead stage
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-3 p-1 rounded-xl bg-white/5 border border-glass-border/30">
                                <Activity size={16} className="text-neon-cyan ml-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary mr-4">Live Tracker</span>
                            </div>
                        </div>
                        <PipelineTracker currentStage={lead.pipelineStage} allStages={PIPELINE_STAGES} onStageChange={handleStageChange} />
                    </Card>

                    {/* Workflow Sections */}
                    {(lead.productType === 'rooftop' || lead.productType === 'pump' || lead.source === 'Manual_Offline') && (
                        <div className="space-y-8">
                            <h3 className="text-xl font-black text-text-primary tracking-tight ml-2">Technical Workflow</h3>
                            {lead.productType === 'rooftop' && (
                                <Card className="bg-glass-surface/10 border-glass-border/20">
                                    <RooftopWorkflowSection lead={lead} onUpdate={setLead} />
                                </Card>
                            )}
                            {(lead.productType === 'pump' || (lead.source === 'Manual_Offline' && lead.productType !== 'rooftop')) && (
                                <Card className="bg-glass-surface/10 border-glass-border/20">
                                    <LeadsWorkflowSection lead={lead} onUpdate={setLead} />
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Application Details Card */}
                    <Card className="bg-glass-surface/20 border-glass-border/30">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-xl font-black text-text-primary tracking-tight">Application Details</h3>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={handleEditClick}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-glass-border/30 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all font-bold text-xs uppercase tracking-widest"
                                >
                                    <Edit2 size={16} />
                                    Edit Details
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-cyan text-white font-bold text-xs uppercase tracking-widest shadow-glow-sm shadow-neon-cyan/20 hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-glass-border/30 text-text-secondary hover:text-error-red hover:border-error-red/50 transition-all font-bold text-xs uppercase tracking-widest"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <DetailItem label="Full Name" value={lead.name} />
                                <DetailItem label="Email Address" value={lead.email} />
                                <DetailItem label="Phone Number" value={lead.phone} />
                                <DetailItem label="Product Type" value={lead.productType} />

                                {lead.source === 'Manual_Offline' && (
                                    <>
                                        <DetailItem label="Father Name" value={lead.fatherName} />
                                        <DetailItem label="District" value={lead.district} />
                                        <DetailItem label="Tehsil" value={lead.tehsil} />
                                        <DetailItem label="Village" value={lead.village} />
                                        <DetailItem label="HP" value={lead.hp} />
                                        <DetailItem label="Connection Type" value={lead.connectionType} />
                                    </>
                                )}
                                {lead.source !== 'Manual_Offline' && <DetailItem label="Location (District)" value={lead.customFields?.district} />}

                                {(() => {
                                    const REQUIRED_IMAGE_FIELDS = ['customerPic', 'paymentSlip', 'structurePic', 'paymentProof', 'passbook'];
                                    
                                    // Standardized helper for custom field parsing
                                    let fieldsObj = typeof lead.customFields === 'string'
                                        ? JSON.parse(lead.customFields || '{}')
                                        : (lead.customFields || {});
                                    try {
                                        // Double check if it was a stringified JSON inside an object
                                        if (typeof fieldsObj === 'string') fieldsObj = JSON.parse(fieldsObj);
                                    } catch (e) {
                                        console.error("Failed to parse customFields", e);
                                        fieldsObj = {};
                                    }

                                    const allFields = { ...fieldsObj };
                                    REQUIRED_IMAGE_FIELDS.forEach(field => {
                                        if (!(field in allFields)) allFields[field] = null;
                                    });

                                    return Object.entries(allFields)
                                        .filter(([key]) => key !== 'district' && key !== 'basicProfile')
                                        .map(([key, value]) => {
                                            const isImageField = REQUIRED_IMAGE_FIELDS.includes(key) || formSchema.get(key) === 'image' || String(value).startsWith('http');
                                            return (
                                                <DetailItem
                                                    key={key}
                                                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                    value={value}
                                                    isImage={isImageField}
                                                    onView={openPreview}
                                                    onDelete={handleDeleteDocument}
                                                    canDelete={user?.role === 'Master'}
                                                    onUpload={isImageField && !value ? (file) => handleSpecificFileUpload(key, file) : undefined}
                                                />
                                            );
                                        });
                                })()}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { label: 'Name', key: 'name', type: 'text' },
                                    { label: 'Email', key: 'email', type: 'email' },
                                    { label: 'Phone', key: 'phone', type: 'text' },
                                    { label: 'Product Type', key: 'productType', type: 'text' }
                                ].map(f => (
                                    <div key={f.key} className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan/70 ml-1">{f.label}</label>
                                        <input
                                            type={f.type}
                                            value={editData[f.key] || ''}
                                            onChange={(e) => handleEditChange(f.key, e.target.value)}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                ))}

                                {lead.source === 'Manual_Offline' && [
                                    'fatherName', 'district', 'tehsil', 'village', 'hp', 'connectionType'
                                ].map(key => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan/70 ml-1">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </label>
                                        <input
                                            type="text"
                                            value={editData[key] || ''}
                                            onChange={(e) => handleEditChange(key, e.target.value)}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                ))}

                                {Object.entries(editData.customFields || {}).filter(([key]) => key !== 'district' && key !== 'basicProfile').map(([key, value]) => {
                                    const isImageField = ['customerPic', 'paymentSlip', 'structurePic', 'paymentProof', 'passbook'].includes(key) || formSchema.get(key) === 'image' || (typeof value === 'string' && value.startsWith('http'));
                                    if (isImageField) return null;
                                    return (
                                        <div key={key} className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan/70 ml-1">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </label>
                                            <input
                                                type="text"
                                                value={value as string || ''}
                                                onChange={(e) => handleEditChange(key, e.target.value, true)}
                                                className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column (4/12) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Vendor Assignment */}
                    {user?.role === 'Master' && (
                        <Card className="bg-glass-surface/20 border-glass-border/30">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-warning-yellow/10 text-warning-yellow">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="text-xl font-black text-text-primary tracking-tight">Assign Vendor</h3>
                            </div>
                            <div className="relative group">
                                <select
                                    value={lead.assignedVendorId || ''}
                                    title="Assign Vendor"
                                    onChange={(e) => handleVendorAssign(e.target.value)}
                                    className="w-full bg-white/5 border border-glass-border/30 rounded-2xl px-4 py-4 text-sm font-bold text-text-primary appearance-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all cursor-pointer"
                                >
                                    <option value="" className="bg-night-sky">Unassigned</option>
                                    {vendors.map(vendor => (
                                        <option key={vendor.id} value={vendor.id} className="bg-night-sky">
                                            {vendor.name} ({vendor.district})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover:text-neon-cyan transition-colors">
                                    <ChevronRight size={18} className="rotate-90" />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Activity & Notes */}
                    <Card className="bg-glass-surface/20 border-glass-border/30 overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-electric-blue/10 text-electric-blue">
                                <Activity size={24} />
                            </div>
                            <h3 className="text-xl font-black text-text-primary tracking-tight">Activity Log</h3>
                        </div>

                        <form onSubmit={handleAddNote} className="relative mb-8">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a professional note..."
                                title="Note Content"
                                className="w-full bg-white/5 border border-glass-border/30 rounded-2xl p-4 text-sm font-bold text-text-primary focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue outline-none transition-all min-h-[120px] resize-none"
                            ></textarea>
                            <button
                                type="submit"
                                disabled={isSubmittingNote}
                                title="Post Note"
                                className="absolute bottom-4 right-4 p-3 rounded-xl bg-electric-blue text-white shadow-glow-sm shadow-electric-blue/20 hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {isSubmittingNote ? <LoadingSpinner size="sm" /> : <Plus size={20} />}
                            </button>
                        </form>

                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {lead.activityLog.slice().reverse().map((activity: LeadActivity, index) => (
                                <div key={activity.timestamp + index} className="relative pl-8 pb-6 last:pb-0">
                                    {index !== lead.activityLog.length - 1 && (
                                        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-glass-border/20" />
                                    )}
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-white/5 border border-glass-border/30 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-glow-sm shadow-neon-cyan/50" />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-widest text-text-primary">{activity.action}</p>
                                        {activity.notes && (
                                            <div className="bg-white/5 border border-glass-border/10 rounded-xl p-3 mt-2">
                                                <p className="text-sm font-medium text-text-secondary leading-relaxed italic">"{activity.notes}"</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary/50 pt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-glass-border/30" />
                                            <span>{activity.user}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Documents */}
                    <Card className="bg-glass-surface/20 border-glass-border/30">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-xl font-black text-text-primary tracking-tight">Documents</h3>
                            </div>
                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-glass-border/30 text-[10px] font-black text-text-secondary">
                                {lead.documents.length} Files
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            {lead.documents.map((doc: LeadDocument) => (
                                <div key={doc.filename} className="group flex justify-between items-center bg-white/5 border border-glass-border/20 p-4 rounded-2xl hover:border-neon-cyan/30 transition-all">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-text-primary truncate" title={doc.filename}>{doc.filename}</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => openPreview(doc.filename.startsWith('http') ? doc.filename : `${API_BASE_URL}/files/${doc.id}`)}
                                            className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-neon-cyan transition-all"
                                            title="View Document"
                                        >
                                            <ClipboardCheck size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-error-red transition-all"
                                            title="Delete Document"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {lead.documents.length === 0 && (
                                <div className="text-center py-8 border border-dashed border-glass-border/30 rounded-2xl bg-white/5">
                                    <p className="text-sm font-bold text-text-secondary/40 italic">No documents found</p>
                                </div>
                            )}
                        </div>

                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="group w-full flex items-center justify-center gap-3 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-neon-cyan hover:text-white transition-all duration-500 shadow-glow-sm shadow-neon-cyan/5"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                            Add New Document
                        </button>
                    </Card>
                </div>
            </div>

            {isDeleteModalOpen && (
                <DeleteConfirmationModal
                    itemName={lead.name || 'this lead'}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                />
            )}

            <DocumentPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                fileUrl={previewUrl || ''}
            />
        </div>
    );
};

export default LeadDetailPage;
