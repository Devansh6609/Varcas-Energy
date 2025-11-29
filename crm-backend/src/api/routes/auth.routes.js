const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const validate = require('../middlewares/validate.middleware');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth.validators');

router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;