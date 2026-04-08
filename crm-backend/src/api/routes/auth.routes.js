import { Hono } from 'hono';
import * as authController from '../controllers/auth.controller.js';

const auth = new Hono();

auth.post('/login', authController.login);
auth.post('/request-reset', authController.requestPasswordReset);
auth.post('/reset-password', authController.resetPassword);

export default auth;