const masterOnlyMiddleware = async (c, next) => {
    const user = c.get('user');
    if (user && user.role === 'Master') {
        await next();
    } else {
        return c.json({ message: 'Access denied: Master priority only.' }, 403);
    }
};

export default masterOnlyMiddleware;
