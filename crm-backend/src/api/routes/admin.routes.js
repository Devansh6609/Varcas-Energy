const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const masterOnlyMiddleware = require('../middlewares/masterOnly.middleware');

const router = express.Router();

const upload = require('../../config/storage.config');

// --- Multer Setup for CSV Import (Local Temp Storage) ---
// We use local storage for CSVs because we need to read them with fs.readFileSync immediately
const tempUploadsDir = path.join(__dirname, '../../../temp_uploads');
if (!fs.existsSync(tempUploadsDir)) {
    fs.mkdirSync(tempUploadsDir, { recursive: true });
}
const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, tempUploadsDir); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const uploadTemp = multer({ storage: tempStorage });


// Protect all admin routes
router.use(authMiddleware);

// --- SSE for real-time updates ---
router.get('/events', adminController.getRealtimeEvents);

// --- Dashboard ---
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/charts', adminController.getChartData);

// --- Leads ---
router.get('/leads', adminController.getLeads);
// router.get('/leads/export', adminController.exportLeads); // TODO: Implement exportLeads function
router.post('/leads/import', masterOnlyMiddleware, uploadTemp.single('leadsCsv'), adminController.importLeads);
router.get('/leads/:id', adminController.getLeadDetails);
router.patch('/leads/:id', upload.any(), adminController.updateLead);
router.delete('/leads/:id', masterOnlyMiddleware, adminController.deleteLead);
router.post('/leads/:id/notes', adminController.addLeadNote);
router.post('/leads/:id/documents', upload.single('document'), adminController.uploadLeadDocument);
router.delete('/leads/:id/documents/:docId', adminController.deleteLeadDocument);
router.post('/leads/manual', upload.single('basicProfile'), adminController.createManualLead);
// FIX: Add route for bulk lead actions.
router.post('/leads/bulk-action', adminController.performBulkLeadAction);

// --- Vendor Management (Master Only) ---
router.get('/vendors', masterOnlyMiddleware, adminController.getVendors);
router.post('/vendors', masterOnlyMiddleware, adminController.createVendor);

// --- Admin Management (Master Only) ---
router.get('/admins', masterOnlyMiddleware, adminController.getMasterAdmins);
router.post('/admins', masterOnlyMiddleware, adminController.createMasterAdmin);

// --- Secure User Deletion (Master Only) ---
router.post('/users/request-deletion-otp', masterOnlyMiddleware, adminController.requestUserDeletionOtp);
router.post('/users/confirm-deletion', masterOnlyMiddleware, adminController.deleteUserWithOtp);

// --- User Profile ---
router.patch('/profile', upload.single('profileImage'), adminController.updateProfile);

// --- Form Builder & Settings (Master Only) ---
router.put('/forms/:formType', masterOnlyMiddleware, adminController.updateFormSchema);
router.get('/settings', masterOnlyMiddleware, adminController.getSettings);
router.post('/settings', masterOnlyMiddleware, adminController.saveSettings);
router.post('/leads/:id/generate-summary', masterOnlyMiddleware, adminController.generateLeadSummary);


module.exports = router;