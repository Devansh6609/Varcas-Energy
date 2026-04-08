import { verify } from 'hono/jwt';

const authMiddleware = async (c, next) => {
    if (c.req.method === 'OPTIONS') {
        return next();
    }
    
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'No token provided' }, 401);
    }

    const token = authHeader.split(' ')[1];
    try {
        const secret = c.env.JWT_SECRET || 'varcas_secret_key_2024';
        const decoded = await verify(token, secret, 'HS256');
        
        const prisma = c.get('prisma');
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            console.error("Auth Middleware Error: Decoded User not found in DB:", decoded.userId);
            return c.json({ message: 'User not found' }, 401);
        }
        
        c.set('user', user);
        await next();
    } catch (error) {
        console.error("Auth Middleware Error: Token Verification Failed:", error.message);
        return c.json({ message: 'Invalid or expired token' }, 401);
    }
};

export default authMiddleware;
