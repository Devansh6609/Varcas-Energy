import bcrypt from 'bcryptjs';
import { calculateScore, getScoreStatus } from '../utils/leadScoring.js';
import { createNotification } from './notification.controller.js';
import crypto from 'node:crypto';

// In-memory store for OTPs. In production, use KV or a similar shared store on Cloudflare.
const deletionOtps = new Map();

// Helper to get buffer from Hono File/Blob
async function getBuffer(file) {
    if (!file) return null;
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// ==================== DASHBOARD ====================

export const getDashboardStats = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        let where = {};
        if (user.role === 'Vendor') {
            where = { assignedVendorId: user.id };
        }

        const totalLeads = await prisma.lead.count({ where });
        
        const conversions = await prisma.lead.count({ 
            where: { ...where, pipelineStage: 'Closed Won / Project' } 
        });

        const activeLeads = await prisma.lead.count({
            where: {
                ...where,
                pipelineStage: { in: ['New Lead', 'Verified Lead', 'Qualified (Vetting)', 'Site Survey Scheduled', 'Proposal Sent', 'Negotiation/Finance'] }
            }
        });

        const leadConversion = totalLeads > 0 ? (conversions / totalLeads) : 0;

        return c.json({
            totalLeads,
            activeLeads,
            conversions,
            avgConversionRate: (leadConversion * 100).toFixed(1) + '%'
        });
    } catch (e) {
        console.error("Dashboard Stats Error:", e);
        return c.json({ message: 'Error fetching stats', error: e.message }, 500);
    }
};

export const getChartData = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        let where = {};
        if (user.role === 'Vendor') {
            where = { assignedVendorId: user.id };
        }

        const leads = await prisma.lead.findMany({
            where,
            select: { createdAt: true, pipelineStage: true }
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const timeSeriesLeads = months.map(m => ({ name: m, leads: 0, conversions: 0 }));

        leads.forEach(l => {
            const d = new Date(l.createdAt);
            const m = d.getMonth();
            timeSeriesLeads[m].leads++;
            if (l.pipelineStage === 'Closed Won / Project') timeSeriesLeads[m].conversions++;
        });

        // Mock revenue data for now based on conversions
        const timeSeriesRevenue = timeSeriesLeads.map(item => ({
            name: item.name,
            revenue: item.conversions * 150000 // Average deal size 1.5L
        }));

        return c.json({
            timeSeriesLeads,
            timeSeriesRevenue
        });
    } catch (e) {
        console.error("Chart Data Error:", e);
        return c.json({ message: 'Error fetching chart data' }, 500);
    }
};

// ==================== LEADS ====================

export const getLeads = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const { status, priority, search } = c.req.query();

        let where = {};
        if (user.role === 'Vendor') {
            where.assignedVendorId = user.id;
        }

        if (status && status !== 'All') where.pipelineStage = status;
        if (priority && priority !== 'All') where.priority = priority;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        const rawLeads = await prisma.lead.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: { assignedTo: { select: { name: true } } }
        });

        // Map back to 'status' for frontend compatibility and parse JSON fields
        const leads = rawLeads.map(l => ({
            ...l,
            status: l.pipelineStage,
            customFields: typeof l.customFields === 'string' ? JSON.parse(l.customFields) : l.customFields
        }));

        return c.json(leads);
    } catch (e) {
        console.error("Get Leads Error:", e);
        return c.json({ message: 'Error fetching leads' }, 500);
    }
};

export const getLeadDetails = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                activityLog: { orderBy: { timestamp: 'desc' } },
                documents: { orderBy: { uploadedAt: 'desc' } },
                assignedTo: { select: { name: true, email: true } }
            }
        });
        if (!lead) return c.json({ message: 'Lead not found' }, 404);
        return c.json({
            ...lead,
            status: lead.pipelineStage,
            notes: lead.activityLog, // alias for frontend compatibility
            customFields: typeof lead.customFields === 'string' ? JSON.parse(lead.customFields) : lead.customFields
        });
    } catch (e) {
        console.error("Get Lead Details Error:", e);
        return c.json({ message: 'Error fetching lead details' }, 500);
    }
};

export const updateLead = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const data = await c.req.json();
        
        const oldLead = await prisma.lead.findUnique({ where: { id } });
        if (!oldLead) return c.json({ message: 'Lead not found' }, 404);

        if (data.assignedVendorId && data.assignedVendorId !== oldLead.assignedVendorId) {
            await createNotification(prisma, data.assignedVendorId, 'Lead_Assigned', `New lead assigned: ${oldLead.name}`, `#/leads/${id}`);
        }

        // Map 'status' from frontend to 'pipelineStage' in DB
        if (data.status && !data.pipelineStage) {
            data.pipelineStage = data.status;
            delete data.status;
        }

        // Stringify customFields if provided as an object (Prisma TEXT column requires string)
        if (data.customFields && typeof data.customFields === 'object') {
            data.customFields = JSON.stringify(data.customFields);
        }

        const updatedLead = await prisma.lead.update({
            where: { id },
            data
        });
        return c.json({ 
            ...updatedLead, 
            status: updatedLead.pipelineStage,
            customFields: typeof updatedLead.customFields === 'string' ? JSON.parse(updatedLead.customFields || '{}') : (updatedLead.customFields || {})
        });
    } catch (e) {
        console.error("Update Lead Error:", e);
        return c.json({ message: 'Error updating lead' }, 500);
    }
};

export const addLeadNote = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const body = await c.req.json();
        const user = c.get('user');
        
        // The schema has Activity model, not Note. Use Activity as the note storage.
        const content = body.content || body.note || '';
        const activity = await prisma.activity.create({
            data: { 
                leadId: id, 
                action: 'Note Added',
                notes: content, 
                user: user.name 
            }
        });
        return c.json(activity, 201);
    } catch (e) {
        console.error("Add Note Error:", e);
        return c.json({ message: 'Error adding note' }, 500);
    }
};

export const uploadLeadDocument = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const body = await c.req.parseBody();
        const file = body.file || body.document;
        if (!file) return c.json({ message: 'No file uploaded' }, 400);

        const buffer = await getBuffer(file);
        const key = `leads/${id}/${crypto.randomUUID()}-${file.name}`;
        
        // Upload to R2
        if (c.env.BUCKET) {
            await c.env.BUCKET.put(key, buffer, {
                httpMetadata: { contentType: file.type }
            });
        }

        const doc = await prisma.document.create({
            data: {
                leadId: id,
                filename: file.name,
                mimeType: file.type,
                url: key,
                size: buffer.length
            }
        });
        return c.json(doc, 201);
    } catch (e) {
        console.error("Upload error:", e);
        return c.json({ message: 'Error uploading document' }, 500);
    }
};

export const deleteLeadDocument = async (c) => {
    try {
        const prisma = c.get('prisma');
        const docId = c.req.param('docId');
        
        const doc = await prisma.document.findUnique({ where: { id: docId } });
        if (!doc) return c.json({ message: 'Document not found' }, 404);

        // Delete from R2 if available
        if (doc.url && c.env.BUCKET) {
            try { await c.env.BUCKET.delete(doc.url); } catch (e) { /* ignore R2 errors */ }
        }

        await prisma.document.delete({ where: { id: docId } });
        return c.json({ success: true });
    } catch (e) {
        console.error("Delete Document Error:", e);
        return c.json({ message: 'Error deleting document' }, 500);
    }
};

export const generateLeadSummary = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) return c.json({ message: 'Lead not found' }, 404);

        // Stub: generate a basic summary from lead data
        const summary = `Lead "${lead.name || 'Unknown'}" (${lead.productType || 'N/A'}) is currently at stage "${lead.pipelineStage}". Contact: ${lead.phone || lead.email || 'N/A'}. Score: ${lead.score}/100 (${lead.scoreStatus}).`;
        
        return c.json({ summary });
    } catch (e) {
        console.error("Generate Summary Error:", e);
        return c.json({ message: 'Error generating summary' }, 500);
    }
};

export const createManualLead = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.parseBody();
        
        // Extract fields — could come as FormData or JSON
        const name = body.name || '';
        const email = body.email || '';
        const phone = body.phone || '';
        const productType = body.productType || 'other';
        const assignedVendorId = body.assignedVendorId || null;
        
        const score = calculateScore({ productType, phone });
        
        const lead = await prisma.lead.create({
            data: {
                name,
                email,
                phone,
                productType,
                customFields: body.customFields ? (typeof body.customFields === 'string' ? body.customFields : JSON.stringify(body.customFields)) : '{}',
                score,
                scoreStatus: getScoreStatus(score),
                source: 'Manual_Entry',
                pipelineStage: 'New Lead',
                otpVerified: true,
                assignedVendorId
            }
        });
        return c.json(lead, 201);
    } catch (e) {
        console.error("Create Manual Lead Error:", e);
        return c.json({ message: 'Error creating lead' }, 500);
    }
};

export const deleteLead = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        // Delete related records first (SQLite doesn't cascade by default)
        await prisma.activity.deleteMany({ where: { leadId: id } });
        await prisma.document.deleteMany({ where: { leadId: id } });
        await prisma.lead.delete({ where: { id } });
        return c.json({ success: true });
    } catch (e) {
        console.error("Delete Lead Error:", e);
        return c.json({ message: 'Error deleting lead' }, 500);
    }
};

export const performBulkLeadAction = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { leadIds, action, value } = await c.req.json();
        if (action === 'delete') {
            await prisma.activity.deleteMany({ where: { leadId: { in: leadIds } } });
            await prisma.document.deleteMany({ where: { leadId: { in: leadIds } } });
            await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
        } else if (action === 'assign') {
            await prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { assignedVendorId: value } });
        } else if (action === 'status' || action === 'changeStage') {
            await prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { pipelineStage: value } });
        } else if (action === 'assignVendor') {
            await prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { assignedVendorId: value } });
        }
        return c.json({ success: true });
    } catch (e) {
        console.error("Bulk Action Error:", e);
        return c.json({ message: 'Error performing bulk action' }, 500);
    }
};

export const importLeads = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.parseBody();
        const file = body.file;
        if (!file) return c.json({ message: 'No file uploaded' }, 400);

        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',');
        const leadsToCreate = lines.slice(1).map(line => {
            const values = line.split(',');
            const lead = {};
            headers.forEach((h, i) => lead[h.trim()] = values[i]?.trim());
            
            const score = calculateScore(lead);
            return {
                name: lead.name || 'Unknown',
                email: lead.email || null,
                phone: lead.phone || null,
                productType: lead.productType || 'other',
                pipelineStage: 'New_Lead',
                score,
                scoreStatus: getScoreStatus(score),
                source: 'Bulk_Import'
            };
        });

        // D1/SQLite doesn't support createMany well, create one by one
        let created = 0;
        for (const leadData of leadsToCreate) {
            try {
                await prisma.lead.create({ data: leadData });
                created++;
            } catch (e) { console.error('Error importing single lead:', e); }
        }
        return c.json({ message: `Successfully imported ${created} leads` });
    } catch (e) {
        console.error("Import Error:", e);
        return c.json({ message: 'Error importing leads' }, 500);
    }
};

// ==================== VENDORS ====================

export const getVendors = async (c) => {
    try {
        const prisma = c.get('prisma');
        const vendors = await prisma.user.findMany({
            where: { role: 'Vendor' },
            select: { id: true, name: true, email: true, state: true, district: true }
        });
        return c.json(vendors);
    } catch (e) {
        console.error("Get Vendors Error:", e);
        return c.json({ message: 'Error fetching vendors' }, 500);
    }
};

export const createVendor = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { name, email, password, state, district } = await c.req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        const vendor = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: 'Vendor', state, district }
        });
        return c.json(vendor, 201);
    } catch (e) {
        console.error("Create Vendor Error:", e);
        return c.json({ message: 'Error creating vendor' }, 500);
    }
};

// ==================== ADMIN MANAGEMENT ====================

export const getMasterAdmins = async (c) => {
    try {
        const prisma = c.get('prisma');
        const admins = await prisma.user.findMany({
            where: { role: 'Master' },
            select: { id: true, name: true, email: true, country: true }
        });
        return c.json(admins);
    } catch (e) {
        console.error("Get Admins Error:", e);
        return c.json({ message: 'Error fetching master admins' }, 500);
    }
};

export const createMasterAdmin = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { name, email, password, country } = await c.req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: 'Master', country }
        });
        return c.json(admin, 201);
    } catch (e) {
        console.error("Create Admin Error:", e);
        return c.json({ message: 'Error creating master admin' }, 500);
    }
};

// ==================== USER DELETION ====================

export const requestUserDeletionOtp = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        const userId = body.userId || body.userIdToDelete;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return c.json({ message: 'User not found' }, 404);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        deletionOtps.set(userId, otp);
        
        console.log(`[DELETION OTP for ${user.email}]: ${otp}`);
        
        return c.json({ message: 'Deletion OTP generated. In production, this would be sent via email.' });
    } catch (e) {
        console.error("OTP Error:", e);
        return c.json({ message: 'Error generating OTP' }, 500);
    }
};

export const deleteUserWithOtp = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        const userId = body.userId || body.userIdToDelete;
        const otp = body.otp;
        const storedOtp = deletionOtps.get(userId);

        if (otp === storedOtp) {
            await prisma.user.delete({ where: { id: userId } });
            deletionOtps.delete(userId);
            return c.json({ success: true });
        } else {
            return c.json({ message: 'Invalid OTP' }, 400);
        }
    } catch (e) {
        console.error("Delete User Error:", e);
        return c.json({ message: 'Error deleting user' }, 500);
    }
};

// ==================== PROFILE ====================

export const updateProfile = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const body = await c.req.parseBody();
        
        const updateData = {};
        if (body.name) updateData.name = body.name;
        
        // Handle profile image upload to R2
        if (body.profileImage && typeof body.profileImage !== 'string') {
            const file = body.profileImage;
            const buffer = await getBuffer(file);
            const key = `profiles/${user.id}/${crypto.randomUUID()}-${file.name}`;
            if (c.env.BUCKET) {
                await c.env.BUCKET.put(key, buffer, {
                    httpMetadata: { contentType: file.type }
                });
            }
            updateData.profileImage = key;
        }

        if (Object.keys(updateData).length === 0) {
            return c.json({ message: 'No fields to update' }, 400);
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, profileImage: true, state: true, district: true, country: true }
        });
        
        return c.json(updatedUser);
    } catch (e) {
        console.error("Update Profile Error:", e);
        return c.json({ message: 'Error updating profile' }, 500);
    }
};

// ==================== SETTINGS ====================

export const getSettings = async (c) => {
    try {
        const prisma = c.get('prisma');
        const settings = await prisma.setting.findMany();
        // Convert array to key-value object for frontend
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.key] = s.value; });
        return c.json(settingsObj);
    } catch (e) {
        console.error("Get Settings Error:", e);
        return c.json({ message: 'Error fetching settings' }, 500);
    }
};

export const updateSettings = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        
        // Accept { apiKey: 'value' } or { key: 'value', ... }
        const entries = Object.entries(body);
        for (const [key, value] of entries) {
            await prisma.setting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        }
        
        return c.json({ success: true, message: 'Settings updated successfully' });
    } catch (e) {
        console.error("Update Settings Error:", e);
        return c.json({ message: 'Error updating settings' }, 500);
    }
};

// ==================== FORM BUILDER ====================

export const updateFormSchema = async (c) => {
    try {
        const prisma = c.get('prisma');
        const formType = c.req.param('formType');
        const schemaString = await c.req.text(); // Get raw JSON string to save directly

        // Upsert setting
        await prisma.setting.upsert({
            where: { key: `form_${formType}` },
            update: { value: schemaString },
            create: { key: `form_${formType}`, value: schemaString }
        });

        return c.json({ success: true, message: 'Form schema updated successfully' });
    } catch (e) {
        console.error("Error updating form schema:", e);
        return c.json({ message: 'Error updating form schema' }, 500);
    }
};

// ==================== EVENTS (SSE Stub) ====================

export const getEvents = async (c) => {
    // Return an empty event stream message. 
    // Cloudflare Workers don't support long-polling, so this returns an empty response.
    return c.json({ type: 'HEARTBEAT', data: null, message: 'No new events' });
};