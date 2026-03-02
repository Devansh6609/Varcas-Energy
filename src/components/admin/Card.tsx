import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`
            bg-glass-surface/20 backdrop-blur-3xl 
            border border-glass-border/30 
            rounded-[2.5rem] shadow-2xl
            p-6 md:p-8 transition-all duration-500
            hover:border-white/20 hover:shadow-glow-cyan/10
            ${className}
        `}>
            {children}
        </div>
    );
};

export default Card;