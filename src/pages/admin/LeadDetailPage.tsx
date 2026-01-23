import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lead, LeadActivity, LeadDocument, PipelineStage, FormField, User } from '../../types';
import { getLeadDetails, getFormSchema, getVendors, updateLead, addLeadNote, uploadDocument, deleteLead, deleteDocument } from '../../service/adminService';
import { PIPELINE_STAGES } from '../../constants';
import { Trash2, ClipboardCheck, Edit2, Save, X } from 'lucide-react';
import PipelineTracker from '../../components/admin/PipelineTracker';
import { LeadsWorkflowSection } from '../../components/admin/LeadsWorkflowSection';
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
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-text-muted">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-text-light flex items-center gap-2 flex-wrap">
            {isImage ? (
                value ? (
                    <>
                        <button
                            onClick={() => onView?.(value.startsWith('http') ? value : `${API_BASE_URL}/files/${value}`)}
                            className="bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full text-xs hover:bg-accent-blue/20 flex items-center gap-1 transition-colors"
                            type="button"
                        >
                            <ClipboardCheck className="w-3 h-3" /> View Document
                        </button>
                        {canDelete && onDelete && (
                            <button
                                onClick={() => onDelete(value)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete Document"
                                type="button"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </>
                ) : (
                    onUpload && (
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-colors">
                            <span className="text-xs">+ Upload</span>
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
                    ) || <span className="text-gray-400 italic">Not Uploaded</span>
                )
            ) : (
                String(value || 'N/A')
            )}
        </dd>
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
        <div>
            <div className="mb-6">
                <Link to="/admin/leads" className="text-accent-blue hover:underline">&larr; Back to Pipeline</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-text-light">{lead.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-text-muted">{lead.email} | {lead.phone}</p>
                                {user?.role === 'Master' && (
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-text-muted mt-2">
                                        Assigned to: <span className="font-semibold text-gray-800 dark:text-text-light">{lead.assignedVendorName || 'Unassigned'}</span>
                                    </p>
                                )}
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                <span className={`inline-block px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${lead.scoreStatus === 'Hot' ? 'bg-error-red/20 text-error-red' : lead.scoreStatus === 'Warm' ? 'bg-warning-yellow/20 text-warning-yellow' : 'bg-accent-blue/20 text-accent-blue'}`}>
                                    {lead.scoreStatus} ({lead.score})
                                </span>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-text-muted mt-1">Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
                                {user?.role === 'Master' && (
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="mt-4 text-xs text-error-red hover:underline flex items-center gap-1 sm:justify-end ml-auto sm:ml-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        Delete Lead
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Sales Pipeline</h3>
                        <PipelineTracker currentStage={lead.pipelineStage} allStages={PIPELINE_STAGES} onStageChange={handleStageChange} />
                    </Card>

                    {/* Manual Workflow Section */}
                    {lead.source === 'Manual_Offline' && (
                        <Card>
                            <LeadsWorkflowSection lead={lead} onUpdate={setLead} />
                        </Card>
                    )}

                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light">Application Details</h3>
                            {!isEditing ? (
                                <button
                                    onClick={handleEditClick}
                                    className="text-gray-500 hover:text-accent-blue transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Edit Details"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                        className="text-green-600 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
                                        title="Save Changes"
                                    >
                                        <Save className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Cancel"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {!isEditing ? (
                            <dl className="grid grid-cols-2 gap-x-3 gap-y-4 md:gap-x-4 md:gap-y-6">
                                <DetailItem label="Name" value={lead.name} />
                                <DetailItem label="Email" value={lead.email} />
                                <DetailItem label="Phone" value={lead.phone} />
                                <DetailItem label="Product Type" value={lead.productType} />
                                {/* Manual Workflow Fields Display */}
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
                                {/* FIX: The 'location' property does not exist on the Lead type. Use customFields.district instead. */}
                                {lead.source !== 'Manual_Offline' && <DetailItem label="Location (District)" value={lead.customFields?.district} />}

                                {(() => {
                                    const REQUIRED_IMAGE_FIELDS = ['customerPic', 'paymentSlip', 'structurePic', 'paymentProof', 'passbook'];

                                    // Merge existing customFields with required fields (init to null if missing)
                                    const allFields = { ...lead.customFields };
                                    REQUIRED_IMAGE_FIELDS.forEach(field => {
                                        if (!(field in allFields)) {
                                            allFields[field] = null;
                                        }
                                    });

                                    return Object.entries(allFields)
                                        .filter(([key]) => key !== 'district' && key !== 'basicProfile')
                                        .sort(([keyA], [keyB]) => {
                                            // Optional: sort required fields to the end or beginning?
                                            // For now, simple sort or keep as is (Object.entries order is insertion order usually)
                                            // Let's just keep them mingled.
                                            return 0;
                                        })
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
                            </dl>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editData.name || ''}
                                        onChange={(e) => handleEditChange('name', e.target.value)}
                                        className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editData.email || ''}
                                        onChange={(e) => handleEditChange('email', e.target.value)}
                                        className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editData.phone || ''}
                                        onChange={(e) => handleEditChange('phone', e.target.value)}
                                        className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">Product Type</label>
                                    <input
                                        type="text"
                                        value={editData.productType || ''}
                                        onChange={(e) => handleEditChange('productType', e.target.value)}
                                        className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm"
                                    />
                                </div>

                                {lead.source === 'Manual_Offline' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">Father Name</label>
                                            <input type="text" value={editData.fatherName || ''} onChange={(e) => handleEditChange('fatherName', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">District</label>
                                            <input type="text" value={editData.district || ''} onChange={(e) => handleEditChange('district', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">Tehsil</label>
                                            <input type="text" value={editData.tehsil || ''} onChange={(e) => handleEditChange('tehsil', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">Village</label>
                                            <input type="text" value={editData.village || ''} onChange={(e) => handleEditChange('village', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">HP</label>
                                            <input type="text" value={editData.hp || ''} onChange={(e) => handleEditChange('hp', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">Connection Type</label>
                                            <input type="text" value={editData.connectionType || ''} onChange={(e) => handleEditChange('connectionType', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm" />
                                        </div>
                                    </>
                                )}

                                {Object.entries(editData.customFields || {}).filter(([key]) => key !== 'district' && key !== 'basicProfile').map(([key, value]) => {
                                    const isImageField = ['customerPic', 'paymentSlip', 'structurePic', 'paymentProof', 'passbook'].includes(key) || formSchema.get(key) === 'image' || (typeof value === 'string' && value.startsWith('http'));

                                    if (isImageField) return null; // Don't allow editing image strings directly, use upload.

                                    return (
                                        <div key={key}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-muted mb-1">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </label>
                                            <input
                                                type="text"
                                                value={value as string || ''}
                                                onChange={(e) => handleEditChange(key, e.target.value, true)}
                                                className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color text-sm"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {user?.role === 'Master' && (
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Assign Vendor</h3>
                            <select
                                value={lead.assignedVendorId || ''}
                                onChange={(e) => handleVendorAssign(e.target.value)}
                                className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color focus:ring-accent-blue focus:border-accent-blue text-gray-900 dark:text-text-light"
                            >
                                <option value="">Unassigned</option>
                                {vendors.map(vendor => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.name} ({vendor.district}, {vendor.state})
                                    </option>
                                ))}
                            </select>
                        </Card>
                    )}



                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Activity & Notes</h3>
                        <form onSubmit={handleAddNote} className="mb-4">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                                className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color focus:ring-accent-blue focus:border-accent-blue"
                                rows={3}
                            ></textarea>
                            <button type="submit" disabled={isSubmittingNote} className="mt-2 w-full flex items-center justify-center bg-gray-200 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-100 dark:bg-gray-700 dark:text-text-light dark:hover:bg-gray-600 dark:disabled:bg-gray-800">
                                {isSubmittingNote ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Saving...
                                    </>
                                ) : 'Add Note'}
                            </button>
                        </form>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                            {lead.activityLog.slice().reverse().map((activity: LeadActivity, index) => (
                                <div key={activity.timestamp + index} className="text-sm border-l-2 border-gray-300 dark:border-border-color pl-3">
                                    <p className="font-semibold text-gray-800 dark:text-text-light">{activity.action}</p>
                                    {activity.notes && <p className="text-gray-600 dark:text-text-muted bg-gray-100 dark:bg-primary-background p-2 rounded-md mt-1">{activity.notes}</p>}
                                    <p className="text-xs text-gray-500 dark:text-text-muted mt-1">{new Date(activity.timestamp).toLocaleString()} by {activity.user}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Documents</h3>
                        <div className="space-y-2 mb-4">
                            {lead.documents.map((doc: LeadDocument) => (
                                <div key={doc.filename} className="flex justify-between items-center bg-gray-100 dark:bg-primary-background p-2 rounded-md">
                                    <span className="text-sm truncate pr-2 text-gray-700 dark:text-text-primary" title={doc.filename}>{doc.filename}</span>
                                    <a
                                        href={doc.filename.startsWith('http') ? doc.filename : `${API_BASE_URL}/files/${doc.filename}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-accent-blue hover:underline hidden" // Hide default link
                                    >
                                        View
                                    </a>
                                    <button
                                        onClick={() => openPreview(doc.filename.startsWith('http') ? doc.filename : `${API_BASE_URL}/files/${doc.id}`)}
                                        className="text-xs text-accent-blue hover:underline font-medium mr-2"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Delete Document"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {lead.documents.length === 0 && <p className="text-sm text-gray-500 dark:text-text-muted">No documents uploaded.</p>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-secondary-cyan/10 text-secondary-cyan font-semibold py-2 rounded-md hover:bg-secondary-cyan/20 dark:bg-secondary-cyan/20 dark:hover:bg-secondary-cyan/30">
                            + Upload Document
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