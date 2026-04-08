import { Hono } from 'hono';
import * as notificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const notifications = new Hono();

notifications.use('*', authMiddleware);

notifications.get('/', notificationController.getNotifications);
notifications.patch('/:id/read', notificationController.markAsRead);

export default notifications;
