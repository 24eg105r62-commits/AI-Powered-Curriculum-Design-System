import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const ScheduleView = ({ schedule }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSection = () => {
        setCurrentIndex((prev) => (prev + 1) % schedule.length);
    };

    const prevSection = () => {
        setCurrentIndex((prev) => (prev - 1 + schedule.length) % schedule.length);
    };

    const currentSection = schedule[currentIndex];

    if (!schedule || schedule.length === 0) return null;

    return (
        <div className="glass-panel p-2 md:p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 px-4">
                <button
                    onClick={prevSection}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                        {currentSection.name}
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm">Weekly Timetable</p>
                </div>

                <button
                    onClick={nextSection}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1 rounded-xl border border-[var(--glass-border)] bg-black/5">
                <div className="min-w-[800px] p-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="grid grid-cols-6 gap-2 mb-2">
                                <div className="p-3 bg-[var(--surface)] text-[var(--text)] rounded-lg text-center font-bold">Period</div>
                                {currentSection.days.map(d => (
                                    <div key={d.day} className="p-3 bg-[var(--surface)] rounded-lg text-center font-bold text-[var(--primary)]">
                                        {d.day}
                                    </div>
                                ))}
                            </div>

                            {/* We need to pivot the data: Rows = Time Slots, Cols = Days */}
                            {/* Assuming all days have same number of slots */}
                            {currentSection.days[0].slots.map((_, slotIndex) => (
                                <div key={slotIndex} className="grid grid-cols-6 gap-2 mb-2">
                                    <div className="flex items-center justify-center p-3 bg-[var(--surface)] rounded-lg font-mono text-sm text-[var(--text)]">
                                        {slotIndex + 1}
                                    </div>
                                    {currentSection.days.map((dayData, dayIdx) => {
                                        const slot = dayData.slots[slotIndex];
                                        const isLunch = slot.type === 'Lunch';
                                        const isFree = slot.type === 'Free';

                                        let bgClass = "bg-slate-800/40 border-slate-700/50";
                                        if (isLunch) bgClass = "bg-yellow-500/10 border-yellow-500/20";
                                        if (isFree) bgClass = "bg-green-500/10 border-green-500/20";
                                        if (!isLunch && !isFree) bgClass = "bg-[var(--surface)] border-[var(--glass-border)]";

                                        return (
                                            <div
                                                key={dayIdx}
                                                className={`p-3 rounded-lg border ${bgClass} backdrop-blur-sm min-h-[80px] flex flex-col justify-center transition-all hover:scale-[1.02]`}
                                            >
                                                <div className="font-bold text-sm md:text-base leading-tight text-[var(--primary)]">
                                                    {slot.subject}
                                                </div>
                                                {slot.teacher && (
                                                    <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)] inline-block"></span>
                                                        {slot.teacher}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500/20 border border-indigo-500/50 rounded"></div> Class
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500/50 rounded"></div> Lunch
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500/20 border border-green-500/50 rounded"></div> Free/Library
                </div>
            </div>
        </div>
    );
};

export default ScheduleView;
