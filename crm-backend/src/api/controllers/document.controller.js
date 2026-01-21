const prisma = require('../../config/prisma');

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
            res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
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
