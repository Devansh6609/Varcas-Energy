const prisma = require('../../config/prisma');
const { getRealtimeEvents } = require('./admin.controller');

// Helper to send notification via SSE (imported from admin.controller or defined here if we refactor)
// For now, we'll assume we can access the clients list or use a shared event emitter. 
// Since admin.controller has the clients list locally, we might need to export a 'sendEventToUser' function from there.
// For this step, I'll implement the controller logic and we'll wire up the SSE export in the next step.

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(skip),
        });

        const total = await prisma.notification.count({ where: { userId } });
        const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } });

        res.json({
            notifications,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            },
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // 'all' or specific ID

        if (id === 'all') {
            await prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            });
        } else {
            await prisma.notification.update({
                where: { id, userId },
                data: { isRead: true }
            });
        }

        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Error updating notification status' });
    }
};

// Internal helper to create notification
const createNotification = async (userId, type, message, link = null) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                link
            }
        });
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};
