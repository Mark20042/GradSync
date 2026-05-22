# <p align="center">🎓 GradSync</p>

<p align="center">
  <strong>Bridging the Gap Between Graduates and Employers with AI.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 🚀 Overview

**GradSync** is a premium, AI-powered career development ecosystem designed to streamline the transition from academic life to professional careers. By combining local AI intelligence with modern web technologies, GradSync provides a secure and efficient platform for automated skill verification, interactive mock interviews, and high-performance recruitment.

## ✨ Core Features

### 🛡️ Secure Verification

- **Automated Document OCR**: High-speed verification of Transcripts (TOR) and Business Permits using `Tesseract.js`.
- **Verified Badges**: Earn verifiable skill rankings (Entry to Expert) through standardized testing.

### 🤖 AI-Driven Preparation

- **Mock Interview Room**: Real-time evaluation of candidate responses using native Web STT/TTS and local Ollama models.
- **AI Career Mentor**: A 24/7 AI-powered coach offering personalized career guidance and preparation strategies.

### 💼 Professional Tools

- **Dynamic Resume Builder**: Professional PDF generation with automated summary crafting based on user skills and history.
- **Smart Matching**: AI-calculated job suitability scores to help graduates find their perfect career fit.

---

## 🛠️ Technology Stack

| Layer            | Technologies                                                      |
| :--------------- | :---------------------------------------------------------------- |
| **Frontend**     | React 19, Vite, Tailwind CSS, Framer Motion, GSAP, Lucide Icons   |
| **Backend**      | Node.js (Express), TypeScript, MongoDB (Mongoose), JWT, Socket.io |
| **AI/ML Engine** | Ollama (Local LLM), Tesseract.js (OCR), PDF-Parse                 |
| **Connectivity** | Web Speech API (STT/TTS), WebRTC (Live Preview)                   |

---

## 🏗️ System Architecture

```mermaid
flowchart TD

subgraph group_client["React client"]
node_landing["Landing page<br/>public UI<br/>[LandingPage.jsx]"]
node_auth["Auth flows<br/>auth UI<br/>[Login.jsx]"]
node_jobseeker["Job seeker<br/>role UI"]
node_employer["Employer<br/>role UI"]
node_admin["Admin<br/>role UI<br/>[AdminDashboard.jsx]"]
node_assessment_ui["Assessments<br/>workflow UI"]
node_interview_ui["Interviews<br/>workflow UI<br/>[InterviewRoom.jsx]"]
node_shared_ui["Shared UI<br/>components"]
node_client_state(("Auth state<br/>context/routes<br/>[AuthContext.jsx]"))
end

subgraph group_server["Express API"]
node_api_routes["HTTP routes<br/>express routes"]
node_controllers["Controllers<br/>use-cases"]
node_models[("Mongo models<br/>persistence")]
node_middlewares["Middleware<br/>policy/ingress"]
node_services["Services<br/>integrations"]
end

subgraph group_shared["Cross-cutting"]
node_ai_workflow{{"AI workflow<br/>ai orchestration"}}
node_ocr{{"OCR service<br/>document extraction<br/>[ocr.service.ts]"}}
node_realtime(("Socket channel<br/>realtime<br/>[socket.service.ts]"))
node_storage{{"File storage<br/>media service"}}
node_email{{"Email delivery<br/>notifications<br/>[email.service.ts]"}}
node_db[("MongoDB<br/>database<br/>[db.ts]")]
end

node_landing -->|"guest access"| node_client_state
node_auth -->|"login/session"| node_client_state
node_jobseeker -->|"protected routes"| node_client_state
node_employer -->|"protected routes"| node_client_state
node_admin -->|"admin guard"| node_client_state
node_assessment_ui -->|"authenticated access"| node_client_state
node_interview_ui -->|"session access"| node_client_state
node_jobseeker -->|"renders"| node_shared_ui
node_employer -->|"renders"| node_shared_ui
node_admin -->|"renders"| node_shared_ui
node_api_routes -->|"guarded by"| node_middlewares
node_api_routes -->|"dispatches to"| node_controllers
node_controllers -->|"reads/writes"| node_models
node_controllers -->|"orchestrates"| node_services
node_controllers -->|"sends"| node_email
node_controllers -->|"publishes"| node_realtime
node_controllers -->|"uploads"| node_storage
node_services -->|"runs"| node_ai_workflow
node_services -->|"extracts text"| node_ocr
node_models -->|"persists in"| node_db
node_jobseeker -->|"fetches data"| node_api_routes
node_employer -->|"manages hiring"| node_api_routes
node_admin -->|"admin ops"| node_api_routes
node_assessment_ui -->|"assessment APIs"| node_api_routes
node_interview_ui -->|"session APIs"| node_api_routes

click node_landing "https://github.com/mark20042/gradsync/blob/main/client/src/pages/LandingPage/LandingPage.jsx"
click node_auth "https://github.com/mark20042/gradsync/blob/main/client/src/pages/Auth/Login.jsx"
click node_jobseeker "https://github.com/mark20042/gradsync/blob/main/client/src/pages/JobSeeker/JobSeekerDashboard.jsx"
click node_employer "https://github.com/mark20042/gradsync/blob/main/client/src/pages/Employer/EmployerDashboard.jsx"
click node_admin "https://github.com/mark20042/gradsync/blob/main/client/src/pages/Admin/AdminDashboard.jsx"
click node_assessment_ui "https://github.com/mark20042/gradsync/blob/main/client/src/pages/Assessment/AssessmentTaking.jsx"
click node_interview_ui "https://github.com/mark20042/gradsync/blob/main/client/src/pages/Interview/InterviewRoom.jsx"
click node_shared_ui "https://github.com/mark20042/gradsync/tree/main/client/src/components"
click node_client_state "https://github.com/mark20042/gradsync/blob/main/client/src/context/AuthContext.jsx"
click node_api_routes "https://github.com/mark20042/gradsync/tree/main/new-sirbir/src/routes"
click node_controllers "https://github.com/mark20042/gradsync/tree/main/new-sirbir/src/controllers"
click node_models "https://github.com/mark20042/gradsync/tree/main/new-sirbir/src/models"
click node_middlewares "https://github.com/mark20042/gradsync/tree/main/new-sirbir/src/middlewares"
click node_services "https://github.com/mark20042/gradsync/tree/main/new-sirbir/src/services"
click node_ai_workflow "https://github.com/mark20042/gradsync/blob/main/new-sirbir/src/services/ai/workflows/interview-agent.workflow.ts"
click node_ocr "https://github.com/mark20042/gradsync/blob/main/new-sirbir/src/utils/ocr.service.ts"
click node_realtime "https://github.com/mark20042/gradsync/blob/main/new-sirbir/src/services/socket.service.ts"
click node_storage "https://github.com/mark20042/gradsync/blob/main/new-sirbir/src/services/cloudinary.service.ts"
click node_email "https://github.com/mark20042/gradsync/blob/main/new-sirbir/src/utils/email.service.ts"
click node_db "https://github.com/mark20042/gradsync/blob/main/new-sirbir/src/config/db.ts"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_landing,node_auth,node_jobseeker,node_employer,node_admin,node_assessment_ui,node_interview_ui,node_shared_ui,node_client_state toneBlue
class node_api_routes,node_controllers,node_models,node_middlewares,node_services toneAmber
class node_ai_workflow,node_ocr,node_realtime,node_storage,node_email,node_db toneMint
```

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.com/) (Running with `qwen2.5:3b` or `llama3.1` model)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Server Setup

```bash
cd server
npm install
npm run dev
```

### 2. Client Setup

```bash
cd client
npm install
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <i>Developed with expertise for the next generation of professionals.</i><br>
  <strong>BY MARK JOSEPH POTOT</strong>
</p>
