import React from 'react';
import { useTheme, Theme } from '../../contexts/ThemeContext';

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themes: { id: Theme; name: string; description: string; colors: string[] }[] = [
        {
            id: 'light-sky',
            name: 'Daylight Sky',
            description: 'Clean, bright interface with crisp white surfaces and sky blue accents.',
            colors: ['#f8fafc', '#0ea5e9', '#3b82f6']
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
        <div className="p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
                <p className="text-text-secondary">Customize your CRM experience.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-glass-border">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Appearance</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`relative group flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 ${theme === t.id
                                ? 'border-electric-blue bg-electric-blue/10 shadow-glow-md shadow-electric-blue/20'
                                : 'border-glass-border hover:border-text-secondary/50 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex -space-x-2">
                                    {t.colors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-full border border-white/10 shadow-sm"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <span className={`font-medium ${theme === t.id ? 'text-electric-blue' : 'text-text-primary'}`}>
                                    {t.name}
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary text-left">
                                {t.description}
                            </p>

                            {theme === t.id && (
                                <div className="absolute top-4 right-4 text-electric-blue">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Placeholder for other settings */}
            <div className="glass-panel p-6 rounded-2xl border border-glass-border bg-glass-surface backdrop-blur-xl opacity-50 pointer-events-none">
                <h2 className="text-xl font-semibold text-text-primary mb-4">Notifications (Coming Soon)</h2>
                <p className="text-text-secondary">Manage your email and push notification preferences.</p>
            </div>
        </div>
    );
};

export default SettingsPage;
