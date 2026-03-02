import React from 'react';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { Settings, Palette, Bell, CheckCircle2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themes: { id: Theme; name: string; description: string; colors: string[] }[] = [
        {
            id: 'professional-dark',
            name: 'Professional Dark',
            description: 'A pitch black, high-contrast theme for focus.',
            colors: ['#000000', '#262626', '#10b981']
        },
        {
            id: 'professional-light',
            name: 'Professional Light',
            description: 'A simple, non-glowing light theme for a professional corporate look.',
            colors: ['#ffffff', '#2563eb', '#64748b']
        },
        {
            id: 'deep-space',
            name: 'Deep Space Glass',
            description: 'Futuristic, high-transparency interface with neon cyan and electric blue accents.',
            colors: ['#0f172a', '#3b82f6', '#06b6d4']
        },
        {
            id: 'midnight',
            name: 'Midnight Obsidian',
            description: 'Premium, grounded dark mode with rich matte surfaces and solar gold accents.',
            colors: ['#020617', '#f59e0b', '#f97316']
        },
        {
            id: 'aurora',
            name: 'Aurora Borealis',
            description: 'Vibrant and dynamic with animated gradients and frosted glass effects.',
            colors: ['#312e81', '#10b981', '#8b5cf6']
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-24">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Settings size={12} className="text-electric-blue" />
                            System
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                        Platform <span className="text-electric-blue">Settings</span>
                    </h1>
                    <p className="text-text-secondary/60 text-sm font-bold">
                        Customize your CRM experience and user preferences.
                    </p>
                </div>
            </div>

            <div className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 shadow-glow-sm shadow-electric-blue/5 p-6 md:p-8 relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <h2 className="text-xl md:text-2xl font-black text-text-primary mb-6 flex items-center gap-3 relative z-10 w-fit">
                    <span className="p-2 rounded-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20 shadow-glow-sm shadow-electric-blue/20">
                        <Palette size={20} />
                    </span>
                    Appearance
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`relative group flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-300 text-left ${theme === t.id
                                ? 'border-electric-blue bg-electric-blue/10 shadow-glow-md shadow-electric-blue/20 scale-[1.02]'
                                : 'border-glass-border/30 bg-night-sky/50 hover:border-glass-border hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center justify-between w-full mb-4">
                                <div className="flex -space-x-2">
                                    {t.colors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 rounded-full border-2 border-night-sky shadow-lg"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                {theme === t.id && (
                                    <div className="text-electric-blue animate-fade-in shadow-glow-sm shadow-electric-blue/30 rounded-full">
                                        <CheckCircle2 size={24} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                    </div>
                                )}
                            </div>

                            <span className={`font-black text-lg mb-2 ${theme === t.id ? 'text-electric-blue' : 'text-text-primary group-hover:text-text-light'}`}>
                                {t.name}
                            </span>

                            <p className="text-sm font-bold text-text-secondary/60 leading-relaxed group-hover:text-text-secondary/80 transition-colors">
                                {t.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Placeholder for other settings */}
            <div className="bg-glass-surface/20 backdrop-blur-xl rounded-3xl border border-glass-border/20 p-6 md:p-8 opacity-60">
                <h2 className="text-xl font-black text-text-primary mb-2 flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-text-secondary/10 text-text-secondary border border-text-secondary/20">
                        <Bell size={20} />
                    </span>
                    Notifications
                    <span className="px-2 py-0.5 rounded-md bg-electric-blue/10 text-electric-blue text-[10px] uppercase tracking-widest ml-2 border border-electric-blue/20">Coming Soon</span>
                </h2>
                <p className="text-text-secondary/60 font-bold ml-14">Manage your email and push notification preferences.</p>
            </div>
        </div>
    );
};

export default SettingsPage;
