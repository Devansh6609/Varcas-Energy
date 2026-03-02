import React from 'react';
import { ClipboardCheck, Briefcase, MapPin, ChevronRight } from 'lucide-react';

const TaskItem: React.FC<{ title: string; count: number; color: string; icon: React.ReactNode }> = ({ title, count, color, icon }) => (
    <div className="group flex justify-between items-center py-4 border-b border-glass-border/10 last:border-b-0 hover:bg-white/[0.02] transition-all px-2 rounded-xl">
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-white/5 border border-glass-border/20 ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary group-hover:text-neon-cyan transition-colors">{title}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">Action Required</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-sm font-black text-text-primary bg-white/5 px-3 py-1 rounded-lg border border-glass-border/20 shadow-inner-glow">
                {count}
            </span>
            <ChevronRight size={14} className="text-text-secondary/30 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" />
        </div>
    </div>
);

interface TaskWidgetProps {
    tasks?: {
        pendingVerifications: number;
        activeProposals: number;
        upcomingSurveys: number;
    };
}

const TaskWidget: React.FC<TaskWidgetProps> = ({ tasks }) => {
    const displayTasks = [
        {
            title: 'Pending Verifications',
            count: tasks?.pendingVerifications ?? 0,
            color: 'text-warning-yellow',
            icon: <ClipboardCheck size={18} />
        },
        {
            title: 'Active Proposals',
            count: tasks?.activeProposals ?? 0,
            color: 'text-neon-cyan',
            icon: <Briefcase size={18} />
        },
        {
            title: 'Upcoming Surveys',
            count: tasks?.upcomingSurveys ?? 0,
            color: 'text-electric-blue',
            icon: <MapPin size={18} />
        },
    ];

    return (
        <div className="p-4 space-y-1">
            {displayTasks.map(task => (
                <TaskItem key={task.title} {...task} />
            ))}
        </div>
    );
};

export default TaskWidget;
