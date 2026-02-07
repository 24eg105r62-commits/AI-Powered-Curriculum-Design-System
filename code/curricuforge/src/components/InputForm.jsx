import React from 'react';
import { Settings, PenTool, User, Clock, CheckCircle2, RotateCcw, BookOpen, Sparkles } from 'lucide-react';

const InputForm = ({ config, setConfig, onGenerate, loading }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayChange = (e) => {
        const { name, value } = e.target;
        // split by comma and trim
        const array = value.split(',').map(item => item.trim());
        setConfig(prev => ({
            ...prev,
            [name]: array
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate(config);
    };

    return (
        <div className="glass-panel p-8 relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-[var(--background)]/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-xl font-semibold animate-pulse text-[var(--primary)]">Optimizing Curriculum...</p>
                </div>
            )}

            <div className="flex items-center gap-3 mb-6 border-b border-[var(--glass-border)] pb-4">
                <Settings className="w-6 h-6 text-[var(--primary)]" />
                <h2 className="text-2xl font-bold">Configuration</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text)]">Grade Levels</label>
                        <input
                            type="number"
                            name="grades"
                            value={config.grades}
                            onChange={handleChange}
                            className="glass-input"
                            min="1" max="12"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text)]">Sections / Grade</label>
                        <input
                            type="number"
                            name="sectionsPerGrade"
                            value={config.sectionsPerGrade}
                            onChange={handleChange}
                            className="glass-input"
                            min="1" max="10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <BookOpenIcon /> Subjects (comma separated)
                    </label>
                    <textarea
                        name="subjects" // We need a way to show array as string
                        value={config.subjects.join(', ')}
                        onChange={handleArrayChange}
                        className="glass-input h-24 resize-none"
                        placeholder="Math, Science, English..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <UserIcon /> Teachers (comma separated)
                    </label>
                    <textarea
                        name="teachers"
                        value={config.teachers.join(', ')}
                        onChange={handleArrayChange}
                        className="glass-input h-24 resize-none"
                        placeholder="Mr. Smith, Mrs. Jones..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                            <ClockIcon /> Classes Per Day
                        </label>
                        <input
                            type="number"
                            name="classesPerDay"
                            value={config.classesPerDay}
                            onChange={handleChange}
                            className="glass-input"
                            min="4" max="10"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Lunch Slot Index</label>
                        <input
                            type="number"
                            name="lunchSlot"
                            value={config.lunchSlot}
                            onChange={handleChange}
                            className="glass-input"
                            min="1" max={config.classesPerDay}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full btn-primary justify-center text-lg mt-4"
                >
                    <SparklesIcon /> Generate Schedule
                </button>
            </form>
        </div>
    );
};

// Simple icons components to avoid import errors if not exported from lucide yet or to keep it clean
// Actually I imported them in App, I should import here too.
// Merged imports at the top, removing this block.
const BookOpenIcon = () => <BookOpen className="w-4 h-4 text-[var(--secondary)]" />;
const UserIcon = () => <User className="w-4 h-4 text-[var(--primary)]" />;
const ClockIcon = () => <Clock className="w-4 h-4 text-[var(--text)]" />;
const SparklesIcon = () => <Sparkles className="w-5 h-5" />;

export default InputForm;
