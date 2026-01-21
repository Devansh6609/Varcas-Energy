
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const publicController = require('../controllers/public.controller');

const router = express.Router();

// --- Multer Setup for public lead forms ---
const upload = require('../../config/storage.config');

// --- Public Routes ---
router.get('/locations/states', publicController.getStates);
router.get('/locations/districts/:state', publicController.getDistricts);
router.get('/forms/:formType', publicController.getFormSchema);

router.post('/leads', publicController.createLead);
router.post('/leads/:leadId/send-otp', publicController.sendOtp);
router.post('/leads/:leadId/verify-otp', publicController.verifyOtp);

// This handles the initial file upload during the multi-step form process.
router.post('/leads/:leadId/application', upload.any(), publicController.handleApplicationFileUpload);

module.exports = router;
