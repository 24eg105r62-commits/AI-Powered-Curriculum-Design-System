const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from root

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/curriculum')
    .then(() => console.log('Connected to MongoDB (curriculum)'))
    .catch(err => console.error('MongoDB connection error:', err));

// Gemini AI Setup (Legacy)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Groq AI Setup
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "your_actual_groq_api_key_here" });

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to db');
});

mongoose.connection.on('error', err => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection disconnected');
});


// Schemas
const UserSchema = new mongoose.Schema({
    name: String,
    institution: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'faculty'], default: 'faculty' },
    subject: String,
    level: { type: String, enum: ['Highschool', 'Juniorschool', 'Kindergarden', 'Other'], default: 'Other' }
});

const TeacherRegistrySchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    teachers: []
});

const ScheduleSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    institution: { type: String, required: true },
    data: Object,
    config: Object,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const TeacherRegistry = mongoose.model('TeacherRegistry', TeacherRegistrySchema);
const Schedule = mongoose.model('Schedule', ScheduleSchema);

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, institution, email, password, subject, level } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const newUser = new User({ name, institution, email, password, role: 'faculty', subject, level });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hardcoded Admin Check
        if (email === 'aadmin@gmail.com' && password === '26265') {
            let admin = await User.findOne({ email });
            if (!admin) {
                admin = new User({
                    name: 'Administrator',
                    institution: 'System',
                    email: 'aadmin@gmail.com',
                    password: '26265',
                    role: 'admin'
                });
                await admin.save();
            }
            return res.status(200).json({ message: 'Login successful', user: admin });
        }

        const user = await User.findOne({ email, password });
        if (user) {
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
});

// Faculty List
app.get('/api/faculty/:institution', async (req, res) => {
    try {
        const { level } = req.query;
        let query = { institution: req.params.institution, role: 'faculty' };
        if (level && level !== 'All') {
            query.level = level;
        }
        const faculty = await User.find(query, 'name email subject level');
        res.status(200).json(faculty);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Teacher Registry
app.post('/api/teachers', async (req, res) => {
    try {
        const { userId, teachers } = req.body;
        await TeacherRegistry.findOneAndUpdate(
            { userId },
            { teachers },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'Teachers saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
});

app.get('/api/teachers/:userId', async (req, res) => {
    try {
        const registry = await TeacherRegistry.findOne({ userId: req.params.userId });
        res.status(200).json(registry ? registry.teachers : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
});

// Schedule
app.post('/api/schedule', async (req, res) => {
    try {
        const { userId, institution, data, config } = req.body;
        // We allow multiple schedules per user now, or we can keep it upsert per user.
        // Let's keep it upsert per user for now as the current logic expects.
        await Schedule.findOneAndUpdate(
            { userId },
            { data, config, institution, createdAt: new Date() },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'Schedule saved', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.toString(), success: false });
    }
});

app.get('/api/schedules/institution/:institution', async (req, res) => {
    try {
        const schedules = await Schedule.find({ institution: req.params.institution }).sort({ createdAt: -1 });
        res.status(200).json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
});

app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find({}).sort({ createdAt: -1 });
        res.status(200).json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
});

app.get('/api/schedule/:userId', async (req, res) => {
    try {
        const schedule = await Schedule.findOne({ userId: req.params.userId });
        res.status(200).json(schedule ? schedule.data : null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
});

// Chatbot Route
app.post('/api/chat', async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === "your_actual_groq_api_key_here") {
            console.error('Chat AI Error: Groq API key is missing or is the placeholder.');
            return res.status(500).json({
                message: 'Groq API key is not configured.',
                error: 'Missing or placeholder API key in .env'
            });
        }

        const { message, scheduleContext, userRole } = req.body;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are CurricuForge AI, a specialized assistant for a school curriculum management system. 
                    Role: ${userRole || 'User'}.
                    Context regarding the current schedule: ${JSON.stringify(scheduleContext || 'No schedule generated yet')}`
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            model: 'llama-3.3-70b-versatile',
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
        res.status(200).json({ reply: reply });
    } catch (error) {
        console.error('Groq AI Error:', error);
        let errorMessage = 'Error communicating with Groq AI';
        if (error.status === 401) {
            errorMessage = 'Invalid Groq API key. Please check your .env file.';
        } else if (error.status === 429) {
            errorMessage = 'Groq API rate limit exceeded. Please wait a moment.';
        }
        res.status(500).json({ message: errorMessage, error: error.toString() });
    }
});

// Start Server
app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});
