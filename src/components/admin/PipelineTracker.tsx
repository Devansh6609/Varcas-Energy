import React from 'react';
import { PipelineStage } from '../../types';
import { Check, ChevronRight, Zap } from 'lucide-react';

interface PipelineTrackerProps {
    currentStage: PipelineStage;
    allStages: PipelineStage[];
    onStageChange: (newStage: PipelineStage) => void;
}

const PipelineTracker: React.FC<PipelineTrackerProps> = ({ currentStage, allStages, onStageChange }) => {
    const currentIndex = allStages.indexOf(currentStage);

    return (
        <div className="space-y-8">
            <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 hide-scrollbar">
                <div className="inline-flex items-center min-w-full py-4">
                    {allStages.map((stage, index) => {
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <React.Fragment key={stage}>
                                <div className="flex flex-col items-center text-center group translate-z-0">
                                    <div
                                        className={`
                                            relative w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center 
                                            transition-all duration-700 border-2 z-10
                                            ${isCurrent ? 'bg-neon-cyan border-neon-cyan shadow-glow-md shadow-neon-cyan/40 scale-110' :
                                                isCompleted ? 'bg-electric-blue/20 border-electric-blue/40 text-electric-blue' :
                                                    'bg-white/5 border-glass-border/30 text-text-secondary'}
                                        `}
                                    >
                                        {isCurrent && (
                                            <div className="absolute inset-x-0 -bottom-4 h-1 bg-neon-cyan rounded-full animate-glow-pulse blur-sm" />
                                        )}
                                        {isCompleted ? (
                                            <Check size={20} className="sm:w-6 sm:h-6 font-black" />
                                        ) : (
                                            <span className={`text-sm sm:text-lg font-black ${isCurrent ? 'text-white' : ''}`}>
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`
                                        mt-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-tight w-24 sm:w-32
                                        transition-colors duration-500
                                        ${isCurrent ? 'text-neon-cyan' : isCompleted ? 'text-electric-blue/80' : 'text-text-secondary/50'}
                                    `}>
                                        {stage}
                                    </p>
                                </div>

                                {index < allStages.length - 1 && (
                                    <div className="relative flex-1 min-w-[3rem] h-[2px] -mt-10 mx-[-1rem]">
                                        <div className={`
                                            absolute inset-0 transition-all duration-1000
                                            ${isCompleted ? 'bg-electric-blue shadow-glow-sm shadow-electric-blue/30' : 'bg-glass-border/20'}
                                        `} />
                                        {isCurrent && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-transparent animate-shimmer" />
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {currentIndex < allStages.length - 1 && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => onStageChange(allStages[currentIndex + 1])}
                        className="group flex items-center gap-3 px-8 py-4 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-neon-cyan hover:text-white transition-all duration-500 shadow-glow-sm shadow-neon-cyan/10"
                    >
                        <Zap size={18} className="group-hover:animate-pulse" />
                        Advance to {allStages[currentIndex + 1]}
                        <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PipelineTracker;