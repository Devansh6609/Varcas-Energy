import React, { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as authService from '../service/authService';
import { Logo } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import CardParticles from '../components/CardParticles';
import { Lock, KeyRound, CheckCircle2, ChevronRight, Info, LogIn } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!token) {
            setError("Invalid reset link. Please try again.");
            return;
        }
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await authService.resetPassword(token, password);
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-night-sky">
            <div className="relative w-full max-w-5xl group transition-transform duration-700">
                <div className="relative z-10 w-full bg-night-sky/80 backdrop-blur-3xl rounded-3xl border border-glass-border/20 overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-12 min-h-[600px]">
                    <CardParticles />

                    {/* Left Side: Branding (Col 5) */}
                    <div className="hidden md:flex md:col-span-5 flex-col justify-between p-12 bg-gradient-to-b from-deep-violet/20 to-transparent border-r border-glass-border/20 relative">
                        <div className="relative z-10">
                            <div className="mb-12 transform hover:scale-105 transition-transform duration-500 w-fit text-white">
                                <Logo />
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                                    New <br /><span className="text-neon-cyan">Identity.</span>
                                </h3>
                                <p className="text-text-secondary font-bold text-sm leading-relaxed max-w-xs">
                                    Finalizing your recovery. Choose a strong, memorable password to protect your account and company assets.
                                </p>
                            </div>
                        </div>
                        <div className="relative z-10 pt-10 border-t border-glass-border/10">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary/40">Secure Key Generation</p>
                        </div>
                    </div>

                    {/* Right Side: Form (Col 7) */}
                    <div className="md:col-span-7 p-8 md:p-14 flex flex-col justify-center bg-white/[0.02]">
                        <div className="w-full max-w-md mx-auto">
                            <div className="mb-10">
                                <div className="p-3 w-fit rounded-2xl bg-neon-cyan/10 text-neon-cyan mb-6 shadow-glow-sm shadow-neon-cyan/20">
                                    <KeyRound size={28} />
                                </div>
                                <h2 className="text-3xl font-black text-text-primary mb-2">Create Password</h2>
                                <p className="text-text-secondary/60 text-sm font-bold">Please define your new secure authentication credentials.</p>
                            </div>

                            {message ? (
                                <div className="animate-fade-in-up text-center space-y-8 py-8 px-6 bg-success-green/5 border border-success-green/20 rounded-3xl">
                                    <div className="w-20 h-20 bg-success-green/10 rounded-full flex items-center justify-center mx-auto text-success-green shadow-glow-sm shadow-success-green/20">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-bold text-text-primary text-xl tracking-tight">Password Updated!</p>
                                        <p className="text-text-secondary/60 text-sm font-bold">{message}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-neon-cyan text-night-sky font-black rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition-all tracking-wide shadow-glow-sm shadow-neon-cyan/30"
                                    >
                                        PROCEED TO LOGIN <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-text-secondary/70 ml-1">New Password</label>
                                        <div className="relative group/input">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within/input:text-neon-cyan transition-colors" size={18} />
                                            <input
                                                type="password"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-glass-border/30 rounded-2xl text-text-primary text-sm focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all placeholder:text-text-secondary/30"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="block text-[10px] font-black uppercase tracking-widest text-text-secondary/70 ml-1">Confirm New Password</label>
                                        <div className="relative group/input">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within/input:text-neon-cyan transition-colors" size={18} />
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-glass-border/30 rounded-2xl text-text-primary text-sm focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all placeholder:text-text-secondary/30"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3.5 bg-error-red/10 border border-error-red/20 rounded-xl flex items-center gap-3 animate-shake">
                                            <Info size={16} className="text-error-red" />
                                            <p className="text-xs font-bold text-error-red">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black rounded-2xl shadow-glow-sm shadow-neon-cyan/30 hover:scale-[1.01] active:scale-[0.98] transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <LoadingSpinner size="sm" className="text-night-sky" />
                                        ) : (
                                            <>
                                                RESET PASSWORD <ChevronRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Attribution */}
            <div className="mt-12 text-center relative z-20">
                <p className="text-xs text-text-secondary/30 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                    <LogIn size={12} />
                    Secure Infrastructure
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;