export const createNotification = async (prisma, userId, type, message, link) => {
    try {
        await prisma.notification.create({
            data: { userId, type, message, link, isRead: false }
        });
    } catch (e) { console.error('Error creating notification:', e); }
};

export const getNotifications = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return c.json(notifications);
    } catch (e) { return c.json({ message: 'Error fetching notifications' }, 500); }
};

export const markAsRead = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        return c.json({ success: true });
    } catch (e) { return c.json({ message: 'Error updating notification' }, 500); }
};
