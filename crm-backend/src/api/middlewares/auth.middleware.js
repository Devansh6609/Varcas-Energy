const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden if token is invalid
            }

            // Optional: Fetch fresh user data from DB if needed, or just use the payload
            // For now, we'll attach the payload to req.user
            req.user = user; 
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

module.exports = authenticate;
