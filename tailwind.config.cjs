/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Theme-aware colors (mapped to CSS variables with alpha support)
        'night-sky': 'rgb(var(--bg-primary) / <alpha-value>)', 
        'deep-violet': 'rgb(var(--bg-secondary) / <alpha-value>)',
        'glass-surface': 'rgb(var(--bg-glass) / <alpha-value>)',
        'glass-border': 'rgb(var(--border-glass) / <alpha-value>)',
        'glow-cyan': 'rgb(var(--accent-glow) / <alpha-value>)',
        
        'electric-blue': 'rgb(var(--accent-primary) / <alpha-value>)',
        'electric-blue-hover': 'rgb(var(--accent-primary-hover) / <alpha-value>)',
        'neon-cyan': 'rgb(var(--accent-secondary) / <alpha-value>)',
        'bright-violet': 'rgb(var(--accent-tertiary) / <alpha-value>)',
        
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-accent': 'rgb(var(--text-accent) / <alpha-value>)',

        // Status Colors
        'status-green': '#22c55e',
        'error-red': '#ef4444',
        'warning-yellow': '#f59e0b',
        
        // --- Shared dark theme colors (Legacy mapping support) ---
        'primary-background': 'rgb(var(--bg-primary) / <alpha-value>)',
        'secondary-background': 'rgb(var(--bg-secondary) / <alpha-value>)',
        'accent-blue': 'rgb(var(--accent-primary) / <alpha-value>)',
        'accent-blue-hover': 'rgb(var(--accent-primary-hover) / <alpha-value>)',
        'secondary-cyan': 'rgb(var(--accent-secondary) / <alpha-value>)',
        'success-green': '#22c55e',
        'text-light': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-secondary) / <alpha-value>)',
        'border-color': 'rgb(var(--border-glass) / <alpha-value>)',
        
        // Original Light Theme Colors (for Public Site)
        'brand-blue': '#293B5F',
        'primary-green': '#10B981',
        'primary-blue': '#3B82F6',
        'accent-orange': '#F97316',
        'accent-orange-hover': '#EA580C',
        'accent-yellow': '#F59E0B',
        'accent-yellow-hover': '#D97706',
      },
      backgroundImage: {
        'electric-gradient': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 8px 0px var(--tw-shadow-color)',
        'glow-md': '0 0 16px 0px var(--tw-shadow-color)',
        'glow-lg': '0 0 24px 0px var(--tw-shadow-color)',
        'inner-glow': 'inset 0 0 10px 0px var(--tw-shadow-color)',
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'marquee': 'marquee 40s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'border-spin': 'borderSpin 4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
            '0%': { transform: 'translateX(0%)' },
            '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
            '50%': { opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.7', boxShadow: '0 0 8px 0px var(--tw-shadow-color)' },
          '50%': { opacity: '1', boxShadow: '0 0 16px 2px var(--tw-shadow-color)' },
        },
        borderSpin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};