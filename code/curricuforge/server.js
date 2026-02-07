import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/curricuforge';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Schema
const ScheduleSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    config: {
        grades: Number,
        sectionsPerGrade: Number,
        subjects: [String],
        teachers: [String],
        classesPerDay: Number,
        lunchSlot: Number
    },
    data: Array
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);

// Routes
app.get('/', (req, res) => {
    res.send('CurricuForge API is running');
});

app.post('/api/save', async (req, res) => {
    try {
        const { config, data } = req.body;

        if (!data || !config) {
            return res.status(400).json({ error: 'Missing data or config' });
        }

        const newSchedule = new Schedule({
            config,
            data
        });

        const saved = await newSchedule.save();
        console.log(`Saved schedule with ID: ${saved._id}`);
        res.status(201).json({ success: true, id: saved._id, message: 'Schedule saved successfully!' });
    } catch (error) {
        console.error('Save Error:', error);
        res.status(500).json({ success: false, error: 'Failed to save schedule' });
    }
});

app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find({}, 'createdAt config').sort({ createdAt: -1 }).limit(10);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

app.get('/api/schedules/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch details' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
