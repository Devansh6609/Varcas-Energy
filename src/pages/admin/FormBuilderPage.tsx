import React, { useState, useEffect } from 'react';
import { getFormSchema, updateFormSchema } from '../../service/adminService';
import { FormSchema, FormField, CalculatorType } from '../../types';
import FormFieldEditor from '../../components/admin/FormFieldEditor';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Settings, Plus, Save, ChevronUp, ChevronDown, Edit2, Trash2, GripVertical, Settings2 } from 'lucide-react';

const FormSection: React.FC<{
    title: string;
    formType: CalculatorType;
}> = ({ title, formType }) => {
    const [fields, setFields] = useState<FormSchema>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingField, setEditingField] = useState<FormField | null>(null);

    useEffect(() => {
        getFormSchema(formType)
            .then(data => setFields(data))
            .catch(() => setError(`Failed to load ${title} form.`))
            .finally(() => setLoading(false));
    }, [formType, title]);

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newFields = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFields.length) return;
        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
        setFields(newFields);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this field?')) {
            setFields(fields.filter(f => f.id !== id));
        }
    };

    const handleSaveField = (field: FormField) => {
        if (editingField) { // Editing existing field
            setFields(fields.map(f => f.id === field.id ? field : f));
        } else { // Adding new field
            setFields([...fields, field]);
        }
        setIsEditorOpen(false);
        setEditingField(null);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await updateFormSchema(formType, fields);
            alert(`${title} form saved successfully!`);
        } catch (err) {
            setError(`Failed to save ${title} form.`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 shadow-glow-sm shadow-electric-blue/5 flex flex-col h-full relative overflow-hidden">
            {/* Decorative Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3 ${formType === CalculatorType.Rooftop ? 'bg-primary-green/10' : 'bg-electric-blue/10'}`}></div>

            <div className="p-6 border-b border-glass-border/20 relative z-10 flex items-center justify-between">
                <h3 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-3">
                    <span className={`p-2 rounded-xl text-white ${formType === CalculatorType.Rooftop ? 'bg-gradient-to-br from-primary-green to-emerald-600 shadow-glow-sm shadow-primary-green/30' : 'bg-gradient-to-br from-electric-blue to-accent-blue shadow-glow-sm shadow-electric-blue/30'}`}>
                        <Settings2 size={18} />
                    </span>
                    {title} Form
                </h3>
            </div>

            <div className="p-6 flex-grow flex flex-col relative z-10">
                {loading && (
                    <div className="flex justify-center p-8">
                        <LoadingSpinner size="lg" className="text-neon-cyan" />
                    </div>
                )}
                {error && <p className="text-error-red font-bold text-center p-4 bg-error-red/5 rounded-xl border border-error-red/10">{error}</p>}

                {!loading && (
                    <div className="space-y-3 flex-grow">
                        {fields.map((field, index) => (
                            <div key={field.id} className="group flex items-center gap-4 p-3 bg-night-sky/50 hover:bg-white/5 border border-glass-border/30 rounded-xl transition-all">
                                <div className="text-text-secondary/40 group-hover:text-neon-cyan/60 transition-colors cursor-grab active:cursor-grabbing">
                                    <GripVertical size={18} />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-text-primary truncate flex items-center gap-2">
                                        {field.label}
                                        {field.required && <span className="text-error-red text-lg leading-none">*</span>}
                                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-text-secondary uppercase tracking-widest font-black ml-2">
                                            {field.type}
                                        </span>
                                    </p>
                                    <p className="text-xs text-text-secondary/60 font-mono truncate mt-0.5">name: "{field.name}"</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="flex flex-col border-r border-glass-border/20 pr-2 mr-1">
                                        <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="text-text-secondary hover:text-neon-cyan disabled:opacity-20 disabled:hover:text-text-secondary transition-colors p-0.5" title="Move Field Up" aria-label="Move Field Up">
                                            <ChevronUp size={14} />
                                        </button>
                                        <button onClick={() => handleMove(index, 'down')} disabled={index === fields.length - 1} className="text-text-secondary hover:text-neon-cyan disabled:opacity-20 disabled:hover:text-text-secondary transition-colors p-0.5 mt-0.5" title="Move Field Down" aria-label="Move Field Down">
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>
                                    <button onClick={() => { setEditingField(field); setIsEditorOpen(true); }} className="p-2 text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-all" title="Edit Field">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(field.id)} className="p-2 text-text-secondary hover:text-error-red hover:bg-error-red/10 rounded-lg transition-all" title="Delete Field">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button onClick={() => { setEditingField(null); setIsEditorOpen(true); }} className="w-full mt-4 flex items-center justify-center gap-2 bg-neon-cyan/5 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/10 font-bold py-3 rounded-xl transition-all border-dashed tracking-wide text-sm">
                            <Plus size={18} />
                            ADD NEW FIELD
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-glass-border/20 bg-black/10 relative z-10 mt-auto">
                <button onClick={handleSaveChanges} disabled={isSaving || loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-sm shadow-neon-cyan/30 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? (
                        <>
                            <LoadingSpinner size="sm" className="!w-4 !h-4 text-night-sky mr-2" />
                            SAVING...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            SAVE CHANGES
                        </>
                    )}
                </button>
            </div>

            {isEditorOpen && (
                <FormFieldEditor
                    field={editingField}
                    onSave={handleSaveField}
                    onClose={() => { setIsEditorOpen(false); setEditingField(null); }}
                />
            )}
        </div>
    );
};


const FormBuilderPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-24">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-warning-yellow/10 border border-warning-yellow/20 text-warning-yellow text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Settings size={12} className="text-warning-yellow" />
                            Configuration
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                        Form <span className="text-warning-yellow">Builder</span>
                    </h1>
                    <p className="text-text-secondary/60 text-sm font-bold">
                        Customize public-facing calculators. Changes are published immediately.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                <FormSection title="Rooftop Solar" formType={CalculatorType.Rooftop} />
                <FormSection title="Solar Pump" formType={CalculatorType.Pump} />
            </div>
        </div>
    );
};

export default FormBuilderPage;