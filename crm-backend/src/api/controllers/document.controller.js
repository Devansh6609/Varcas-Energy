export const getFile = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc) return c.json({ message: 'Document not found' }, 404);
        
        // Files are stored in R2 — the url field is the R2 key
        if (doc.url && c.env.BUCKET) {
            const object = await c.env.BUCKET.get(doc.url);
            if (object) {
                const fileData = await object.arrayBuffer();
                const mimeType = object.httpMetadata?.contentType || doc.mimeType;
                return c.body(fileData, 200, {
                    'Content-Type': mimeType,
                    'Content-Disposition': `inline; filename="${doc.filename}"`
                });
            }
        }

        return c.json({ message: 'File data not found in storage' }, 404);
    } catch (e) {
        console.error('Error fetching file:', e);
        return c.json({ message: 'Error fetching file' }, 500);
    }
};
