import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import CardParticles from '../components/CardParticles';
import { Mail, Lock, LogIn, ChevronRight, UserPlus, Info, Zap } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            const from = (location.state as any)?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-night-sky">
            <div className="relative w-full max-w-5xl group transition-transform duration-700">
                <div className="relative z-10 w-full bg-night-sky/80 backdrop-blur-3xl rounded-3xl border border-glass-border/20 overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-12 min-h-[600px]">
                    <CardParticles />

                    {/* Left Side: Branding/Visual (Col 5) */}
                    <div className="hidden md:flex md:col-span-5 flex-col justify-between p-12 bg-gradient-to-b from-deep-violet/20 to-transparent border-r border-glass-border/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="mb-12 transform hover:scale-105 transition-transform duration-500 w-fit">
                                <Logo />
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                                    Powering <span className="text-neon-cyan">Green</span> Future.
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                                            <Zap size={18} />
                                        </div>
                                        <p className="text-text-secondary font-bold text-sm leading-relaxed">
                                            Advanced CRM for Solar Solutions. Manage leads, track performance, and scale your impact.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-10 mt-10 border-t border-glass-border/10">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary/40">Varcas Energy</p>
                        </div>
                    </div>

                    {/* Right Side: Auth Form (Col 7) */}
                    <div className="md:col-span-7 p-8 md:p-14 flex flex-col justify-center bg-white/[0.02]">
                        <div className="w-full max-w-md mx-auto">
                            {/* Toggle Header */}
                            <div className="flex items-center gap-6 mb-10 border-b border-glass-border/10">
                                <button
                                    onClick={() => setIsSignUp(false)}
                                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${!isSignUp ? 'text-neon-cyan' : 'text-text-secondary/40 hover:text-text-secondary'}`}
                                >
                                    Sign In
                                    {!isSignUp && <div className="absolute bottom-0 left-0 right-0 h-1 bg-neon-cyan shadow-glow-sm shadow-neon-cyan/50 rounded-full"></div>}
                                </button>
                                <button
                                    onClick={() => setIsSignUp(true)}
                                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${isSignUp ? 'text-neon-cyan' : 'text-text-secondary/40 hover:text-text-secondary'}`}
                                >
                                    Sign Up
                                    {isSignUp && <div className="absolute bottom-0 left-0 right-0 h-1 bg-neon-cyan shadow-glow-sm shadow-neon-cyan/50 rounded-full"></div>}
                                </button>
                            </div>

                            {!isSignUp ? (
                                <div className="animate-fade-in-up">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-text-primary mb-2">Welcome Back</h2>
                                        <p className="text-text-secondary/60 text-sm font-bold">Please enter your details to access your dashboard.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-text-secondary/70 ml-1">Email Address</label>
                                            <div className="relative group/input">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within/input:text-neon-cyan transition-colors" size={18} />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    placeholder="name@company.com"
                                                    className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-glass-border/30 rounded-2xl text-text-primary text-sm focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all placeholder:text-text-secondary/30"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between ml-1">
                                                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-text-secondary/70">Password</label>
                                                <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:text-neon-cyan transition-colors">
                                                    Forgot?
                                                </Link>
                                            </div>
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

                                        {error && (
                                            <div className="p-3.5 bg-error-red/10 border border-error-red/20 rounded-xl flex items-center gap-3 animate-shake">
                                                <Info size={16} className="text-error-red" />
                                                <p className="text-xs font-bold text-error-red">{error}</p>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black rounded-2xl shadow-glow-sm shadow-neon-cyan/30 hover:scale-[1.01] active:scale-[0.98] transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                        >
                                            {isLoading ? (
                                                <LoadingSpinner size="sm" className="text-night-sky" />
                                            ) : (
                                                <>
                                                    SIGN IN <ChevronRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="animate-fade-in-up text-center py-8">
                                    <div className="w-20 h-20 bg-neon-cyan/10 border border-neon-cyan/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neon-cyan shadow-glow-sm shadow-neon-cyan/10">
                                        <UserPlus size={36} />
                                    </div>
                                    <h2 className="text-2xl font-black text-text-primary mb-3">Join our Network</h2>
                                    <p className="text-text-secondary font-bold text-sm leading-relaxed mb-8">
                                        Access to Varcas Energy CRM is managed by administrators. Please contact your system supervisor to request an account.
                                    </p>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-8">
                                        <p className="text-xs font-bold text-text-secondary/40 uppercase tracking-widest mb-1">Company Contact</p>
                                        <p className="text-sm font-black text-text-primary">hr@varcasenergy.com</p>
                                    </div>
                                    <button
                                        onClick={() => setIsSignUp(false)}
                                        className="text-sm font-black text-neon-cyan hover:underline tracking-widest uppercase"
                                    >
                                        Return to Sign In
                                    </button>
                                </div>
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

export default LoginPage;