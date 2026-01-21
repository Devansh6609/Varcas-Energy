const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary credentials are provided
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let storage;

if (isCloudinaryConfigured) {
    console.log("Using Cloudinary for file storage.");
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'suryakiran-crm', // Folder name in Cloudinary
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'],
            resource_type: 'auto', // Allow other file types like pdf
        },
    });
} else {
    console.log("Cloudinary credentials missing. Using database storage (via MemoryStorage).");
    storage = multer.memoryStorage();
}

const upload = multer({ storage: storage });

module.exports = upload;
