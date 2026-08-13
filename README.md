
# TakeUForward

> **Turning University Knowledge into Community Opportunity**

TakeUForward is a technology-driven learning and opportunity platform designed to connect **Sri Lankan university students** with **school students and community youth**.

University students can share their knowledge through affordable tuition, courses, workshops, mentorship and mock interviews, while learners can discover opportunities that match their interests, education level and budget.

The platform also uses **AI-powered matching and a RAG-based Opportunity Assistant** to help learners discover relevant educational and career opportunities.

---

## 🎯 Problem

Many students and young people struggle to find:

* Affordable and trustworthy tuition
* Qualified tutors and mentors
* Scholarships
* Internships
* Courses and workshops
* Career guidance
* Educational opportunities suitable for their budget and location

At the same time, university students have valuable knowledge and skills but limited opportunities to use those skills to support their communities and generate income.

TakeUForward connects these two sides through a single platform.

---

## 💡 Solution

TakeUForward provides a platform where:

### Learners can

* Discover learning opportunities
* Search for tutors and mentors
* Filter opportunities by subject, level, budget and delivery mode
* Book learning sessions
* Receive AI-powered opportunity recommendations
* Ask the AI assistant about scholarships, internships and courses
* Find sponsorship opportunities

### University Students can

* Create learning opportunities
* Offer tuition and mentorship
* Accept or reject booking requests
* Manage their opportunities
* Track learners reached and sessions completed
* Build their community impact

### Sponsors can

* Discover eligible learners
* Support educational opportunities
* Make sponsorship pledges
* Track sponsorship history

### Administrators can

* Verify providers
* Manage opportunities
* Manage knowledge-base content
* Monitor platform impact
* Review sponsorship activity

---

## ✨ Key Features

### 🔎 Opportunity Discovery

Learners can discover:

* Tuition
* Courses
* Workshops
* Mentorship
* Mock Interviews
* Scholarships
* Internships
* Other educational opportunities

Opportunities can be filtered by:

* Subject
* Education level
* Budget
* Delivery mode
* Location

---

### 🤖 AI-Powered Matching

TakeUForward uses AI to recommend opportunities based on learner requirements.

Recommended opportunities are marked with an:

**AI Match**

badge.

The matching system can consider information such as:

* Learner interests
* Subject
* Education level
* Budget
* Location
* Delivery preferences

---

### 💬 Opportunity Assistant

The platform includes an AI-powered **Opportunity Assistant**.

Learners can ask questions such as:

> "I'm an A/L student interested in ICT with a limited budget."

The assistant can retrieve relevant information from the platform's knowledge base and provide recommendations with source citations.

---

### 📚 RAG Knowledge System

The AI assistant uses Retrieval-Augmented Generation (RAG).

High-level flow:

```text
User Question
      ↓
Opportunity Assistant
      ↓
Generate Embedding
      ↓
Vector Similarity Search
      ↓
Retrieve Relevant Information
      ↓
Gemini
      ↓
AI Response + Sources
```

This helps the assistant provide answers based on the platform's trusted knowledge rather than relying only on general model knowledge.

---

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │      Users       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ React + Vite     │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Supabase      │
                    ├──────────────────┤
                    │ Authentication   │
                    │ PostgreSQL       │
                    │ pgvector         │
                    │ Edge Functions   │
                    │ Storage          │
                    └───────┬──────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │   Gemini API     │
                    ├──────────────────┤
                    │ Chat             │
                    │ Embeddings       │
                    │ AI Matching      │
                    └──────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Modern responsive UI

### Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Edge Functions
* Supabase Storage

### AI

* Google Gemini
* Gemini Flash for AI responses
* Gemini Embeddings
* RAG
* pgvector

### Deployment

* Vercel — Frontend
* Supabase — Backend, database and Edge Functions

---

## 📁 Project Structure

```text
takeuforward/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── supabase/
│   ├── functions/
│   │   ├── search-opportunities/
│   │   ├── opportunity-assistant/
│   │   └── ...
│   │
│   ├── migrations/
│   └── config.toml
│
├── docs/
│   ├── requirements.md
│   ├── api-contract.md
│   └── ai-rag.md
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Install:

* Node.js
* npm
* Git
* Supabase CLI

You also need access to the TakeUForward Supabase project.

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd takeuforward
```

---

## 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## 3. Configure Frontend Environment Variables

Create:

```text
frontend/.env
```

Add:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

These variables are required by the React frontend.

Do not commit `.env` files containing sensitive credentials.

---

## 4. Configure Supabase Secrets

Gemini credentials should remain server-side inside Supabase Edge Functions.

Example:

```bash
supabase secrets set \
  GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
  GEMINI_CHAT_MODEL="gemini-2.5-flash" \
  GEMINI_EMBEDDING_MODEL="gemini-embedding-2"
```

Do **not** put the Gemini API key inside the React frontend.

---

## 5. Run the Frontend

From the `frontend` directory:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

### Frontend

Only public Supabase configuration should be exposed to the frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Supabase Edge Functions

Server-side secrets:

```text
GEMINI_API_KEY
GEMINI_CHAT_MODEL
GEMINI_EMBEDDING_MODEL
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

to browser-side code.

---

## 🌐 Deployment

### Frontend

The React application can be deployed using Vercel.

Set the Vercel Root Directory to:

```text
frontend
```

Add:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Then deploy.

### Backend

Supabase manages:

* Database
* Authentication
* Edge Functions
* Storage
* Vector search

Deploy Edge Functions using the Supabase CLI.

---

## 👥 User Roles

TakeUForward supports multiple user roles.

| Role     | Main Responsibilities                     |
| -------- | ----------------------------------------- |
| Learner  | Discover and book opportunities           |
| Provider | Create and provide learning opportunities |
| Sponsor  | Support learners and opportunities        |
| Admin    | Verify providers and manage the platform  |

---

## 📊 Social Impact

TakeUForward aims to create a cycle of opportunity:

```text
University Knowledge
        ↓
University Students
        ↓
Affordable Learning
        ↓
School Students & Youth
        ↓
Better Skills & Opportunities
        ↓
Stronger Community
```

The platform can track impact through metrics such as:

* Learners supported
* University providers
* Sessions completed
* Opportunities created
* Sponsored learners
* Sponsorship amount
* Community reach

---

## 🔮 Future Improvements

Potential future features include:

* Sinhala and Tamil AI assistance
* AI-based tutor recommendations
* Location-aware opportunity discovery
* Online payment integration
* Video learning sessions
* Provider ratings and reviews
* Automated provider verification
* Mobile application
* Advanced recommendation models
* Institution partnerships
* Offline/low-bandwidth support
* Regional expansion across Sri Lanka

---

## 🏆 Hackathon Vision

TakeUForward is designed around a simple idea:

> **University knowledge should not stay inside university walls.**

By connecting university students with learners and communities, technology can transform existing knowledge and skills into accessible educational opportunities.

**TakeUForward — Learn. Prepare. Discover.**
