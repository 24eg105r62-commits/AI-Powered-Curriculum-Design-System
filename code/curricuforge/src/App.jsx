import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Download, Save, Moon, Sun, Sparkles, Calendar, Users } from 'lucide-react';
import { generateCurriculum } from './utils/generator';
import InputForm from './components/InputForm';
import ScheduleView from './components/ScheduleView';
import HistoryModal from './components/HistoryModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [savedId, setSavedId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Default config
  const [requestConfig, setRequestConfig] = useState({
    grades: 5,
    sectionsPerGrade: 2,
    subjects: ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'CS', 'Art'],
    teachers: ['Ms. Johnson', 'Mr. Smith', 'Mrs. Davis', 'Mr. Wilson', 'Dr. Brown', 'Ms. Miller'],
    classesPerDay: 7,
    lunchSlot: 4
  });

  // Theme Toggle Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGenerate = (config) => {
    setLoading(true);
    setSavedId(null);
    // Simulate AI thinking time
    setTimeout(() => {
      const result = generateCurriculum(config);
      setSchedule(result);
      setLoading(false);
    }, 800);
  };

  const handleLoadHistory = (fullData) => {
    // Populate config and schedule from saved data
    if (fullData.config) setRequestConfig(fullData.config);
    if (fullData.data) setSchedule(fullData.data);
    if (fullData._id) setSavedId(fullData._id);
  };

  const handleSaveToDB = async () => {
    if (!schedule) return;

    try {
      const response = await fetch('http://localhost:3000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: requestConfig,
          data: schedule
        })
      });
      const result = await response.json();
      if (result.success) {
        setSavedId(result.id);
        alert('Schedule saved successfully!');
      } else {
        alert('Failed to save: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to server. Is it running on port 3000?');
    }
  };

  const downloadPDF = () => {
    if (!schedule) return;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(249, 115, 22); // Orange primary
    doc.text("CurricuForge Master Schedule", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

    schedule.forEach((section, index) => {
      if (index > 0) doc.addPage();

      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(section.name, 14, 40);

      const head = [['Period', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']];
      const tableData = [];
      const periods = section.days[0].slots.length;

      for (let p = 0; p < periods; p++) {
        const row = [`Period ${p + 1}`];
        for (let d = 0; d < 5; d++) {
          const slot = section.days[d].slots[p];
          row.push(`${slot.subject}\n${slot.teacher || ''}`);
        }
        tableData.push(row);
      }

      autoTable(doc, {
        head: head,
        body: tableData,
        startY: 50,
        styles: { fontSize: 8, cellPadding: 3, valign: 'middle', halign: 'center' },
        headStyles: { fillColor: [249, 115, 22] },
        bodyStyles: { textColor: 50 },
        theme: 'grid'
      });
    });

    doc.save("start_curricuforge_schedule.pdf");
  };

  return (
    <div className="min-h-screen relative pb-20">

      {/* Navigation / Header */}
      <nav className="glass-panel sticky top-4 mx-4 md:container md:mx-auto z-50 px-6 py-4 flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-[var(--primary)]" />
          <span className="text-2xl font-bold tracking-tight text-[var(--primary)]">CurricuForge</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 p-2 hover:bg-[var(--glass-border)] rounded-lg transition-colors text-[var(--text)] font-medium text-sm">
            <Calendar className="w-5 h-5" />
            <span className="hidden md:inline">Previous Works</span>
          </button>

          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--text)]">
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4">

        {/* Hero / Welcome */}
        {!schedule && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 pt-10"
          >
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[var(--primary)] text-shadow-sm">
              Design the Future of Learning
            </h1>
            <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
              Generative AI-powered curriculum scheduling for modern institutions.
            </p>
          </motion.div>
        )}

        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Input Form */}
          <div className={`w-full ${schedule ? 'lg:col-span-1' : 'lg:col-span-2 lg:col-start-1 lg:mx-auto lg:w-2/3'}`}>
            <InputForm
              config={requestConfig}
              setConfig={setRequestConfig}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>

          {/* Right: Results View */}
          <AnimatePresence>
            {schedule && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full lg:col-span-2"
              >
                <ScheduleView schedule={schedule} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Buttons */}
      {schedule && (
        <div className="fixed bottom-8 right-8 flex gap-4 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleSaveToDB}
            className="btn-secondary flex items-center gap-2 shadow-lg"
            disabled={!!savedId}
          >
            <Save className="w-5 h-5" />
            {savedId ? 'Saved' : 'Save to DB'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={downloadPDF}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-[var(--primary-glow)]"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </motion.button>
        </div>
      )}
      {/* History Modal */}
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoad={handleLoadHistory}
      />
    </div>
  );
}

export default App;
