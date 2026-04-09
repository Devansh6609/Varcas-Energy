import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Edit3, Eye, Save, Plus, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { getLeadDetails } from '../../service/adminService';
import { Lead } from '../../types';
import { Logo } from '../../constants';
import Card from '../../components/admin/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuotationData {
    consumerName: string;
    date: string;
    systemSize: string;
    discomCharges: number;
    payableCost: number;
    discount: number;
    subsidy: string;
    paymentTerms: {
        registrationFees: number;
        afterDiscomApproval: number;
        afterMaterialDispatch: number;
    };
    brands: {
        solarModule: string;
        inverter: string;
        cables: string;
    };
    materials: {
        structure: string;
        lightningArrestor: string;
        earthingRods: string;
        acdbDcdb: string;
    };
}

const QuotationGeneratorPage: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<QuotationData>({
        consumerName: '',
        date: new Date().toISOString().split('T')[0],
        systemSize: '5.50 KW ( 30 PANEL )',
        discomCharges: 10000,
        payableCost: 275000,
        discount: 5000,
        subsidy: '78000',
        paymentTerms: {
            registrationFees: 10000,
            afterDiscomApproval: 208000,
            afterMaterialDispatch: 52000
        },
        brands: {
            solarModule: 'Adani 550 WP PANEL (30 Years)',
            inverter: 'Microtec (10 Years) INVERTER',
            cables: 'POLYCAB (5 Years )'
        },
        materials: {
            structure: '[40*40] [60*40] 80 micron Hot-Dip Galvanized Iron Pipe',
            lightningArrestor: 'COPPER BOUNDED',
            earthingRods: 'COPPER BOUNDED',
            acdbDcdb: 'Dual SPD L & T, EIMEX or SCHNEIDER'
        }
    });

    useEffect(() => {
        const fetchLead = async () => {
            if (leadId) {
                try {
                    setLoading(true);
                    const lead = await getLeadDetails(leadId);
                    if (lead) {
                        setData(prev => ({
                            ...prev,
                            consumerName: lead.name || '',
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching lead:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchLead();
    }, [leadId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof QuotationData] as any),
                    [child]: value
                }
            }));
        } else {
            setData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const generatePDF = async () => {
        if (!previewRef.current) return;
        setGeneratingPdf(true);
        try {
            // Pre-calculate target dimensions
            const element = previewRef.current;
            const pdf = new jsPDF('p', 'mm', 'a4', true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.offsetHeight,
                windowWidth: element.offsetWidth,
                windowHeight: element.offsetHeight,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('[data-pdf-content]');
                    if (el instanceof HTMLElement) {
                        el.style.transform = 'none';
                        el.style.margin = '0';
                        el.style.padding = '0';
                    }
                }
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Force fit exactly to one page to avoid cutting or slicing
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            pdf.save(`Quotation_${data.consumerName.replace(/\s+/g, '_') || 'Customer'}_${data.date}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setGeneratingPdf(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;

    const payableFinalCost = Number(data.discomCharges) + Number(data.payableCost) - Number(data.discount);
    // Refined scale factor to better fit the A4 preview within its container
    const scaleFactor = windowWidth < 1280 
        ? Math.min(1, (windowWidth - 120) / 800) 
        : Math.min(0.85, (windowWidth / 2 - 160) / 800); 

    return (
        <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto animate-fade-in-up space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-text-secondary hover:text-neon-cyan transition-all duration-300 font-bold uppercase tracking-widest text-xs"
                >
                    <div className="p-2 rounded-xl bg-white/5 border border-glass-border/30 group-hover:border-neon-cyan group-hover:bg-neon-cyan/10 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    Back
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={generatePDF}
                        disabled={generatingPdf}
                        className="px-6 py-3 rounded-2xl bg-neon-cyan text-white font-black uppercase tracking-widest text-xs shadow-glow-sm shadow-neon-cyan/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        {generatingPdf ? <LoadingSpinner size="sm" /> : <Download size={18} />}
                        {generatingPdf ? 'Generating...' : 'Generate PDF'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    <Card className="bg-glass-surface/20 border-glass-border/30 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                                <Edit3 size={24} />
                            </div>
                            <h3 className="text-xl font-black text-text-primary tracking-tight">Quotation Editor</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="consumerName" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Consumer Name</label>
                                        <input
                                            id="consumerName"
                                            type="text"
                                            name="consumerName"
                                            value={data.consumerName}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Date</label>
                                        <input
                                            id="date"
                                            type="date"
                                            name="date"
                                            value={data.date}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label htmlFor="systemSize" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">System Size [KW]</label>
                                        <input
                                            id="systemSize"
                                            type="text"
                                            name="systemSize"
                                            value={data.systemSize}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Cost Calculation</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="discomCharges" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">DISCOM Charges (₹)</label>
                                        <input
                                            id="discomCharges"
                                            type="number"
                                            name="discomCharges"
                                            value={data.discomCharges}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="payableCost" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Payable Cost (₹)</label>
                                        <input
                                            id="payableCost"
                                            type="number"
                                            name="payableCost"
                                            value={data.payableCost}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="discount" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Discount/Gift (₹)</label>
                                        <input
                                            id="discount"
                                            type="number"
                                            name="discount"
                                            value={data.discount}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="subsidy" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Subsidy Note (₹)</label>
                                        <input
                                            id="subsidy"
                                            type="text"
                                            name="subsidy"
                                            value={data.subsidy}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Payment Terms</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="registrationFees" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Reg. Fees (₹)</label>
                                        <input
                                            id="registrationFees"
                                            type="number"
                                            name="paymentTerms.registrationFees"
                                            value={data.paymentTerms.registrationFees}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="afterDiscomApproval" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">After Approval (₹)</label>
                                        <input
                                            id="afterDiscomApproval"
                                            type="number"
                                            name="paymentTerms.afterDiscomApproval"
                                            value={data.paymentTerms.afterDiscomApproval}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="afterMaterialDispatch" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">After Dispatch (₹)</label>
                                        <input
                                            id="afterMaterialDispatch"
                                            type="number"
                                            name="paymentTerms.afterMaterialDispatch"
                                            value={data.paymentTerms.afterMaterialDispatch}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                             <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Premium Brands</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="solarModule" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Solar PV Module</label>
                                        <input
                                            id="solarModule"
                                            type="text"
                                            name="brands.solarModule"
                                            value={data.brands.solarModule}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="inverter" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Inverter</label>
                                        <input
                                            id="inverter"
                                            type="text"
                                            name="brands.inverter"
                                            value={data.brands.inverter}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="cables" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Cables</label>
                                        <input
                                            id="cables"
                                            type="text"
                                            name="brands.cables"
                                            value={data.brands.cables}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Quality Materials</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="structure" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Structure</label>
                                        <textarea
                                            id="structure"
                                            name="materials.structure"
                                            value={data.materials.structure}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all min-h-[60px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lightningArrestor" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Lightning Arrestor</label>
                                        <input
                                            id="lightningArrestor"
                                            type="text"
                                            name="materials.lightningArrestor"
                                            value={data.materials.lightningArrestor}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="earthingRods" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Earthing Rods</label>
                                        <input
                                            id="earthingRods"
                                            type="text"
                                            name="materials.earthingRods"
                                            value={data.materials.earthingRods}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="acdbDcdb" className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">ACDB+DCDB</label>
                                        <input
                                            id="acdbDcdb"
                                            type="text"
                                            name="materials.acdbDcdb"
                                            value={data.materials.acdbDcdb}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8 xl:sticky xl:top-8">
                    <div className="flex items-center justify-between ml-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan">
                                <Eye size={20} />
                            </div>
                            <h3 className="text-lg font-black text-text-primary tracking-tight">Live Preview</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary bg-white/5 px-3 py-1 rounded-full border border-glass-border/30">
                            A4 Standard
                        </span>
                    </div>

                    <div className="relative w-full rounded-2xl border border-glass-border/30 bg-black/20 p-4 sm:p-8 flex justify-center backdrop-blur-sm overflow-hidden" 
                         style={{ minHeight: windowWidth < 1280 ? `${297 * scaleFactor + 40}mm` : 'auto' }}>
                        <div className="origin-top transition-transform duration-300 ease-out shadow-2xl bg-white" 
                             data-pdf-content
                             style={{ 
                                 width: '210mm',
                                 transform: `scale(${scaleFactor})`,
                                 minHeight: '297mm',
                                 height: 'auto'
                             }}>
                            <div 
                                ref={previewRef}
                                className="bg-white text-gray-900 font-sans"
                                style={{ width: '210mm', minHeight: '297mm', height: 'auto', padding: '10mm' }}
                            >
                                <div className="border border-gray-800 min-h-[277mm] p-4 flex flex-col relative h-auto">
                                    <div className="flex flex-col items-center mb-4">
                                        <Logo className="scale-125 mb-4 !text-gray-900" />
                                        <div className="text-center">
                                            <h1 className="text-2xl font-black text-blue-900 tracking-wider mb-1">VARCAS ENERGY</h1>
                                            <div className="w-full h-1 bg-yellow-500 mb-2"></div>
                                            <h2 className="text-lg font-bold tracking-[0.2em] text-gray-800 border-b-2 border-gray-900 inline-block px-12 py-0.5 uppercase">Quotation</h2>
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <section>
                                            <h3 className="font-bold text-xs mb-1.5 text-blue-900 uppercase tracking-wider">Basic Information:</h3>
                                            <table className="w-full border-collapse border-2 border-gray-800 text-xs">
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 font-bold bg-gray-50">Consumer Name</td>
                                                        <td className="border border-gray-800 p-1 text-center font-bold">{data.consumerName || '—'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 font-bold bg-gray-50">Date</td>
                                                        <td className="border border-gray-800 p-1 text-center font-bold uppercase">{new Date(data.date).toLocaleDateString('en-GB')}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 font-bold bg-gray-50">System Size [KW]</td>
                                                        <td className="border border-gray-800 p-1 text-center font-black text-blue-900">{data.systemSize}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </section>

                                        <section>
                                            <h3 className="font-bold text-xs mb-1 text-blue-900 uppercase tracking-wider">Cost Calculation:</h3>
                                            <table className="w-full border-collapse border-2 border-gray-800 text-xs">
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 w-2/3 font-bold bg-gray-50">DISCOM Charges</td>
                                                        <td className="border border-gray-800 p-1 text-left font-bold">₹ {Number(data.discomCharges).toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 font-bold bg-gray-50">Payable Cost</td>
                                                        <td className="border border-gray-800 p-1 text-left font-bold">₹ {Number(data.payableCost).toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 font-bold bg-gray-50">Discount/Gift voucher</td>
                                                        <td className="border border-gray-800 p-1 text-left font-bold">₹ {Number(data.discount).toLocaleString()}</td>
                                                    </tr>
                                                    <tr className="bg-blue-50">
                                                        <td className="border-2 border-gray-800 p-1 font-black text-blue-900">Final Payable Cost</td>
                                                        <td className="border-2 border-gray-800 p-1 text-left font-black text-sm text-blue-900">₹ {payableFinalCost.toLocaleString()}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <p className="mt-1 font-black text-[10px] text-blue-900 bg-yellow-400 inline-block px-3 py-0.5 rounded-sm">NOTE: SUBSIDY ₹ {data.subsidy}*</p>
                                        </section>

                                        <section>
                                            <h3 className="font-bold text-xs mb-1 text-blue-900 uppercase tracking-wider">Payment Terms:</h3>
                                            <table className="w-full border-collapse border-2 border-gray-800 text-xs">
                                                <thead>
                                                    <tr className="bg-gray-800 text-white">
                                                        <th className="border border-gray-800 p-1 text-left w-2/3 uppercase text-[10px]">Description</th>
                                                        <th className="border border-gray-800 p-1 text-center uppercase text-[10px]">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 font-bold">Registration Fees</td>
                                                        <td className="border border-gray-800 p-1 text-left font-bold">₹ {Number(data.paymentTerms.registrationFees).toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 font-bold bg-gray-50 text-blue-900">After DISCOM Approval</td>
                                                        <td className="border border-gray-800 p-1 text-left font-bold bg-gray-50 text-blue-900">₹ {Number(data.paymentTerms.afterDiscomApproval).toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 font-bold">After Material dispatch</td>
                                                        <td className="border border-gray-800 p-1 text-left font-bold">₹ {Number(data.paymentTerms.afterMaterialDispatch).toLocaleString()}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </section>

                                        <div className="grid grid-cols-2 gap-4">
                                            <section>
                                                <h3 className="font-bold text-[10px] mb-1 text-blue-900 uppercase tracking-wider">Guaranteed Premium Brands:</h3>
                                                <table className="w-full border-collapse border border-gray-400 text-[10px]">
                                                    <tbody>
                                                        <tr>
                                                            <td className="border border-gray-800 p-1.5 font-bold bg-gray-50 w-1/3">Solar PV Module</td>
                                                            <td className="border border-gray-800 p-1.5 font-black uppercase text-blue-900">{data.brands.solarModule}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="border border-gray-800 p-1.5 font-bold bg-gray-50">Solar On Grid Inverter</td>
                                                            <td className="border border-gray-800 p-1.5 font-black uppercase text-blue-900">{data.brands.inverter}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="border border-gray-800 p-1.5 font-bold bg-gray-50">AC/DC CABLES</td>
                                                            <td className="border border-gray-800 p-1.5 font-black uppercase text-blue-900">{data.brands.cables}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </section>
                                            <section>
                                                <h3 className="font-bold text-[10px] mb-1 text-blue-900 uppercase tracking-wider">Guaranteed Quality Materials:</h3>
                                                <table className="w-full border-collapse border border-gray-400 text-[10px]">
                                                    <tbody>
                                                        <tr>
                                                            <td className="border border-gray-800 p-1.5 font-bold bg-gray-50 w-1/3 text-[9px]">Structure</td>
                                                            <td className="border border-gray-800 p-1.5 font-black uppercase text-blue-900 text-[9px] leading-tight">{data.materials.structure}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="border border-gray-800 p-1.5 font-bold bg-gray-50 text-[9px]">Lightning Arrestor</td>
                                                            <td className="border border-gray-800 p-1.5 font-black uppercase text-blue-900 text-[9px]">{data.materials.lightningArrestor}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="border border-gray-800 p-1.5 font-bold bg-gray-50 text-[9px]">Earthing Rods</td>
                                                            <td className="border border-gray-800 p-1.5 font-black uppercase text-blue-900 text-[9px]">{data.materials.earthingRods}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="border border-gray-800 p-1.5 font-bold bg-gray-50 text-[9px]">ACDB+DCDB</td>
                                                            <td className="border border-gray-800 p-1.5 font-black uppercase text-blue-900 text-[9px]">{data.materials.acdbDcdb}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </section>
                                        </div>
                                        
                                        <section className="mt-1">
                                            <h3 className="font-bold text-xs mb-1 text-blue-900 uppercase tracking-wider">Terms & Conditions:</h3>
                                            <table className="w-full border-collapse border border-gray-800 text-[9px] leading-tight">
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 text-gray-800 italic">1. Quotation is valid for 10 days from Given Date.</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 text-gray-800 italic">2. System Cost in Cash or Cheque and <span className="font-bold">Structure charge only in cash.</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 text-gray-800 italic">3. It is customer's responsibility to provide the appropriate place for earthing pit, which has no obstacles like pipelines, concrete layer, etc.</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 text-gray-800 italic">4. Once the design is ready according to customer's needs for shadow analysis design, further changes will be charged extra.</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 text-gray-800 italic">5. If customer deny to execute project after DISCOM approval, the registration fees will be charged as cancelation charges.</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 text-gray-800 italic">6. M/s VARCAS ENERGY is bounded to use above mentioned brandsor materials without fail. In case of availability problem then material will be finalize according to mutual decision between customer and VARCAS ENERGY</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-800 p-1 text-gray-800 italic">7. List of Documents: Light Bill, Pan Card, Aadhar Card, Cancel Cheque, Photo [2]</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </section>
                                    </div>
                                    
                                    <div className="mt-2 flex justify-end">
                                        <div className="text-right">
                                            <p className="font-bold text-[10px] text-blue-900 uppercase">SEALED & SIGNED BY</p>
                                            <p className="font-black text-xs text-blue-900 uppercase">VARCAS ENERGY</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotationGeneratorPage;
