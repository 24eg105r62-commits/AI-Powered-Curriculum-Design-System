# CurricuForge: AI-Powered Curriculum Design System

CurricuForge is a specialized platform designed to streamline school curriculum management through automated scheduling and AI-driven assistance.

## 🚀 Key Features

- **Automated Schedule Generation**: Intelligent generation of school timetables.
- **AI Chatbot Assistant**: Specialized AI assistant to help administrators and faculty with system-related queries.
- **Management Dashboard**: Easy-to-use interface for managing subjects, faculty, and schedules.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: 
  - Main: Vanilla HTML/JS
  - Sub-project: React, Vite, Tailwind CSS
- **Database**: MongoDB (Mongoose ODM)
- **AI Provider**: Groq (Llama 3.3 70B)

## 📂 Project Structure

```text
.
├── server.js              # Main Express server (hosts chatbot API and static files)
├── index.html             # Main dashboard and landing page
├── login.html             # User authentication page
├── .env                   # Environment variables (API keys, DB URI) - [Git Ignored]
├── .gitignore             # Git exclusion rules
├── package.json           # Root project dependencies
└── code/
    └── curricuforge/      # Modern React/Vite sub-project
        ├── src/
        │   ├── components/ # React components (ScheduleView, InputForm, etc.)
        │   ├── utils/      # Schedule generation logic
        │   └── App.jsx     # Main React application entry
        ├── public/        # Static assets for the sub-project
        ├── server.js      # Sub-project API server
        └── vite.config.js # Vite build configuration
```

## ⚙️ Setup Instructions

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Configuration**:
    Create a `.env` file in the root with:
    ```env
    GROQ_API_KEY=your_groq_api_key
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    ```
3.  **Run the Server**:
    ```bash
    node server.js
    ```
    Access the app at `http://localhost:3000/index.html`.

---
*Created as part of the Gen AI Hackathon.*
