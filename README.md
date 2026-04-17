# GradSync

GradSync is a modern, AI-powered career development platform designed to bridge the gap between graduates and employers. It features advanced AI mock interviews, automated skill assessment systems, and professional profile management tools.

## 🌟 Core Features

- ** AI Mock Interviewer**: A real-time, interactive interview environment with native voice-to-text (STT) and text-to-speech (TTS) capabilities powered by the Web Speech API.
- ** Automated Verification**: Background OCR-based document verification for graduates (Transcript of Records) and employers (Business Permits) ensuring platform integrity.
- ** Skill Verification Center**: Standardized assessments that allow job seekers to earn "Verified Badges" (Entry, Mid, Senior, Expert) to showcase their proficiency.
- ** Admin Control Panel**: Extensive dashboard for administrators to manage job roles, interview questions, and monitor all candidate evaluation results.
- ** Employer Portal**: Specialized view for employers to browse verified talent, review applicant profiles, and see detailed AI interview breakdowns.
- ** Professional Resume Builder**: Dynamic resume generation tool allowing users to build and export professional career documents.
- ** AI Mentor Chat**: Interactive AI-powered guidance system to assist users with career queries and preparation tips.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Modular & Utility-first)
- **Speech Intelligence**: Native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (Speech-to-Text & Text-to-Speech)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), and [Lottie](https://airbnb.io/lottie/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Real-time**: [Socket.io](https://socket.io/)
- **3D Graphics**: [Three.js](https://threejs.org/) (React Three Fiber)
- **Data Visualization**: [Recharts](https://recharts.org/)

### Backend

- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (MERN Architecture)
- **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/) & [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **Authentication**: JWT (JSON Web Tokens)
- **AI Engine**: [Ollama](https://ollama.com/) (Local Large Language Model integration via LangChain)

## 🏗️ Architecture

The project follows a decoupled, modular architecture:

### 1. Frontend (`/frontend/sipacareer`)

- **Component-Based Architecture**: UI is split into reusable atoms and complex page-level components.
- **State Management**: React Hooks and Context API.
- **Service Layer**: Centralized API utilities using `axiosInstance` for clean backend communication.

### 2. Backend (`/backend`)

- **RESTful API**: Stateless controllers managing business logic.
- **OCR Service**: Dedicated utility for scanning and verifying verification documents using Tesseract and PDF parsing logic.
- **AI Orchestration**: Integration with Ollama via LangChain to process interview transcripts and generate structured suites of feedback.

### 3. AI Service Layer

- **Local AI Processing**: Uses Ollama (Qwen2.5 / Llama models) for low-latency, private, and cost-effective AI evaluations.
- **Structured Scoring**: Converts raw audio transcripts into professional feedback and numerical scores.

## 🚀 Getting Started

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) and [Ollama](https://ollama.com/) installed.
2. **Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
3. **Frontend**:
   ```bash
   cd frontend/sipacareer
   npm install
   npm run dev
   ```

---

_Built with ❤️ by MARK JOSEPH POTOT_
