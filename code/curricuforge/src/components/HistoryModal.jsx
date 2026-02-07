import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, ArrowRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const HistoryModal = ({ isOpen, onClose, onLoad }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/schedules');
            const data = await res.json();
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    const loadItem = async (id) => {
        // Fetch full detail
        try {
            const res = await fetch(`http://localhost:3000/api/schedules/${id}`);
            const fullData = await res.json();
            if (fullData && fullData.data) {
                onLoad(fullData);
                onClose();
            }
        } catch (error) {
            alert('Failed to load schedule');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--surface)] border border-[var(--glass-border)] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
                <div className="p-4 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--background)]">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--primary)]">
                        <Clock className="w-5 h-5" /> Previous Works
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full text-[var(--text)]">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loading && <p className="text-center p-4 text-[var(--text-muted)]">Loading history...</p>}

                    {!loading && history.length === 0 && (
                        <p className="text-center p-4 text-[var(--text-muted)]">No saved schedules found.</p>
                    )}

                    {history.map((item) => (
                        <div
                            key={item._id}
                            className="group p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--background)] hover:border-[var(--primary)] transition-all cursor-pointer flex justify-between items-center"
                            onClick={() => loadItem(item._id)}
                        >
                            <div>
                                <div className="text-sm font-bold text-[var(--text)] mb-1">
                                    {item.config.grades} Grades • {item.config.sectionsPerGrade} Sections
                                </div>
                                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transform group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default HistoryModal;
