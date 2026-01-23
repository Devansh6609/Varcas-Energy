const path = require('path');
const prisma = require('../../config/prisma');


const getMimeType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.pdf': return 'application/pdf';
        case '.doc': return 'application/msword';
        case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        default: return 'application/octet-stream';
    }
};

const getFile = async (req, res, next) => {
    const { id } = req.params;

    try {
        const document = await prisma.document.findUnique({
            where: { id: id }
        });

        if (!document) {
            return next(); // Pass to static middleware
        }

        if (document.data) {
            let contentType = document.mimeType;
            // Fallback inference if missing or generic
            if (!contentType || contentType === 'application/octet-stream') {
                contentType = getMimeType(document.filename);
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', document.data.length);
            res.send(document.data);
        } else {
            // If record exists but no data (e.g. legacy record? or Cloudinary link stored in filename?),
            // handle accordingly.
            // If Cloudinary, redirect?
            if (document.filename.startsWith('http')) {
                return res.redirect(document.filename);
            }
            res.status(404).send('File content not available');
        }

    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getFile
};
