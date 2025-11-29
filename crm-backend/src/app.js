const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiRouter = require('./api/routes');
const helmet = require('helmet');

const app = express();

// --- Middlewares ---
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'], // Allow Dev and Preview
  methods: 'GET,POST,PATCH,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Static File Serving ---
app.use('/files', express.static(path.join(__dirname, '../uploads')));

// --- API Routes ---
const authRoutes = require('./api/routes/auth.routes');
const publicRoutes = require('./api/routes/public.routes');
const adminRoutes = require('./api/routes/admin.routes');
const notificationRoutes = require('./api/routes/notification.routes');

app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Global Error Handler ---
const errorHandler = require('./api/middlewares/error.middleware');
app.use(errorHandler);

module.exports = app;
