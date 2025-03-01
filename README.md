# TEAM NAME : PENGUINS
# PS ID : 03
# Medical Diagnosis System

A comprehensive solution for medical professionals to diagnose patients using AI-powered analysis of symptoms, patient history, and up-to-date medical information.

## Overview

This system helps doctors diagnose patients by:
1. Storing and managing patient metadata
2. Analyzing symptoms against patient history
3. Leveraging an AI RAG agent to query medical databases
4. Continuously updating medical knowledge through web scraping

## Architecture

### Frontend (Next.js)
- Doctor signup/login portal
- Patient management dashboard
- Symptom input interface
- Diagnosis results display

### Backend
- RESTful API endpoints
- Two AI agents:
  1. *Diagnosis Agent*: RAG-based system that analyzes symptoms against patient data
  2. *Knowledge Agent*: Web scraper that updates the database with recent medical information

### Database
- MongoDB for storing:
  - Patient records
  - Medical knowledge base
  - Diagnosis history

## Features

- *Doctor Onboarding*: Simple signup process for medical professionals
- *Patient Management*: Add and update patient metadata
- *Symptom Analysis*: Input symptoms and receive AI-assisted diagnosis
- *Knowledge Base*: Continuously updated medical information via web scraping
- *Historical View*: Track patient diagnosis history

## Technology Stack

- *Frontend*: Next.js, React, TailwindCSS
- *Backend*: Node.js, Express
- *Database*: MongoDB
- *AI Components*: 
  - RAG-based symptom analyzer
  - Web scraping knowledge updater

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB

### Installation Steps

1. Clone the repository
bash
git clone https://github.com/yourusername/medical-diagnosis-system.git
cd medical-diagnosis-system


2. Install dependencies
bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install


3. Configure environment variables
bash
# Create .env.local in frontend directory
# Create .env in backend directory


4. Start the development servers
bash
# Start frontend
cd frontend
npm run dev

# Start backend
cd ../backend
npm run dev


## API Endpoints

### Authentication
- POST /api/auth/signup - Doctor registration
- POST /api/auth/login - Doctor login

### Patients
- GET /api/patients - Get all patients
- POST /api/patients - Add new patient
- GET /api/patients/:id - Get patient details
- PUT /api/patients/:id - Update patient information

### Diagnosis
- POST /api/diagnosis - Analyze symptoms and generate diagnosis
- GET /api/diagnosis/history/:patientId - Get diagnosis history for a patient

## Data Flow

1. Doctor registers and logs into the system
2. Doctor adds patient metadata during registration
3. When diagnosing:
   - Doctor selects a patient from dashboard
   - Doctor inputs observed symptoms
   - System sends symptom data to backend
   - RAG agent queries MongoDB for patient history and relevant medical knowledge
   - System returns diagnosis suggestions

5. In parallel:
   - Knowledge agent periodically scrapes medical websites
   - Processes information into summarized context and key points
   - Updates MongoDB with new medical information

## Security Considerations

- HIPAA compliance for patient data
- Secure authentication for doctors
- Encrypted data transmission
- Regular security audits

## Future Enhancements

- Mobile application for doctors
- Integration with electronic health record (EHR) systems
- Advanced analytics dashboard
- Telemedicine features

## Maintenance

- Regular updates to the web scraping agent to adapt to source website changes
- Database optimization for growing patient records
- Performance monitoring and scaling as needed