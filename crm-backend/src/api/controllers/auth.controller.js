import bcrypt from 'bcryptjs';
import sgMail from '@sendgrid/mail';
import { sign } from 'hono/jwt';
import crypto from 'node:crypto';

export const login = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { email, password } = await c.req.json();
        const user = await prisma.user.findUnique({ where: { email } });

        if (user && await bcrypt.compare(password, user.password)) {
            const { password: _, ...userWithoutPassword } = user;
            
            const payload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
            };
            
            const secret = c.env.JWT_SECRET || 'varcas_secret_key_2024';
            const token = await sign(payload, secret, 'HS256');

            return c.json({ token, user: userWithoutPassword });
        } else {
            return c.json({ message: 'Invalid credentials' }, 401);
        }
    } catch (error) {
        console.error("Login error:", error);
        return c.json({ message: 'An internal server error occurred.' }, 500);
    }
};

export const requestPasswordReset = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { email } = await c.req.json();
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');

            await prisma.user.update({
                where: { email },
                data: { resetToken },
            });
            
            const resetLink = `https://crm.varcasenergy.com/#/reset-password/${resetToken}`;

            if (process.env.SENDGRID_API_KEY) {
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                const fromEmail = process.env.SENDGRID_FROM_EMAIL;
                const msg = {
                    to: email,
                    from: fromEmail || 'devanshagile@gmail.com', 
                    subject: 'SuryaKiran CRM: Password Reset Request',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2>Password Reset</h2>
                            <p>You are receiving this email because a password reset request was initiated for your account.</p>
                            <p>Please click the button below to reset your password. This link is valid for one hour.</p>
                            <a href="${resetLink}" style="background-color: #F97316; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Your Password</a>
                            <p style="margin-top: 20px;">If you did not request a password reset, please ignore this email.</p>
                            <p>- The SuryaKiran Team</p>
                        </div>
                    `,
                };
                await sgMail.send(msg);
            } else {
                console.warn('SENDGRID_API_KEY not found. Logging password reset link:', resetLink);
            }
        }

        return c.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error("Forgot password error:", error);
        return c.json({ message: 'An internal server error occurred.' }, 500);
    }
};

export const resetPassword = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { token, password } = await c.req.json();
        if (!token || !password) {
            return c.json({ message: 'Token and new password are required.' }, 400);
        }

        const user = await prisma.user.findUnique({ where: { resetToken: token } });

        if (!user) {
            return c.json({ message: 'Invalid or expired password reset token.' }, 400);
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
            },
        });

        return c.json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error("Reset password error:", error);
        return c.json({ message: 'An internal server error occurred.' }, 500);
    }
};