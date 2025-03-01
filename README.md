# Clinical Decision Support System

## 🏆 PCCOE GDGC AB 02 Hackathon 2025 - Problem Statement #3 
### Team PENGUINS

## 🔍 Problem Statement #3
*ENHANCING CLINICAL DECISION
SUPPORT SYSTEMS WITH RETRIEVAL-
AUGMENTED GENERATION (RAG) MODEL*

## 📋 Project Overview

AI-Powered Clinical Support is an intelligent medical diagnosis assistant designed to help doctors make more informed decisions by analyzing patient symptoms against their medical history and up-to-date medical research. Our solution combines the power of Next.js, AI-powered RAG (Retrieval-Augmented Generation), and intelligent web scraping to create a comprehensive diagnostic tool.

### Key Features:

- *Smart Patient Management*: Doctors can register patients with comprehensive metadata
- *AI-Powered Symptom Analysis*: Input symptoms to receive AI-assisted diagnosis suggestions
- *Self-Updating Medical Knowledge*: Automatic web scraping keeps the system updated with latest medical information
- *Intuitive UI*: Clean, professional interface designed for busy medical professionals

## 💻 Tech Stack

### Frontend
- *Next.js & React*: For building a fast, responsive user interface
- *TailwindCSS*: For sleek, modern styling
- *SWR*: For efficient data fetching and caching

### Backend
- *Node.js & Express*: For robust API endpoints
- *MongoDB*: For flexible data storage
- *AI Components*: 
  - RAG-based symptom analyzer
  - Web scraping knowledge updater with summarization capabilities

## 🏗 Architecture


┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Next.js   │  ───►   │  Node.js    │  ───►   │  MongoDB    │
│  Frontend   │  ◄───   │  Backend    │  ◄───   │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
                             │   ▲
                             ▼   │
                        ┌─────────────┐
                        │ AI Agents   │
                        │ - RAG       │
                        │ - Scraper   │
                        └─────────────┘


## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB

### Getting Started

1. Clone the repository
bash
git clone https://github.com/team-penguins/mediassist-ai.git
cd mediassist-ai


2. Install dependencies
bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install


3. Set up environment variables
bash
# Frontend (.env.local)
cp frontend/.env.example frontend/.env.local

# Backend (.env)
cp backend/.env.example backend/.env


4. Start development servers
bash
# Start both frontend and backend (from root directory)
npm run dev

# Or start separately
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev


5. Visit http://localhost:3000 to access the application

## 🔄 Workflow

1. *Doctor Registration*: Healthcare professionals register with their credentials
2. *Patient Onboarding*: Doctors add patient metadata (history, allergies, conditions)
3. *Symptom Analysis*:
   - Select patient from dashboard
   - Enter observed symptoms
   - Click "Analyze" to process
4. *Diagnosis Generation*:
   - RAG agent queries patient history and medical knowledge base
   - System returns potential diagnoses with confidence levels
   - References to supporting medical literature provided
5. *Knowledge Base Updates*:
   - System continuously scrapes reliable medical sources
   - Information is processed, summarized, and stored
   - Database is enriched with latest medical findings

## 📊 Project Structure

## 🛠 Future Enhancements

- Real-time collaboration between healthcare professionals
- Integration with wearable devices for continuous monitoring
- Expanded language support for global accessibility
- Medical imaging analysis capabilities

## 🙏 Acknowledgements

- PCCOE GDGC Club for organizing this hackathon
- Our mentors for their valuable guidance
- Open source medical datasets that helped train our models