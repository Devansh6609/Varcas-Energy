import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'professional-dark' | 'professional-light' | 'deep-space' | 'midnight' | 'aurora';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('admin-theme');
        return (savedTheme as Theme) || 'deep-space';
    });

    useEffect(() => {
        localStorage.setItem('admin-theme', theme);
        // DOM manipulation removed to isolate theme to AdminLayout
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
