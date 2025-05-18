# Job Search Assistant - Technical Documentation

## Architecture Overview

The Job Search Assistant is built using a modern web application architecture with a clear separation between frontend and backend components:

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios

### Backend
- **Framework**: Python FastAPI
- **AI Integration**: OpenAI API, LangChain
- **Web Scraping**: LangChain agents with SerpAPI
- **File Processing**: Python-multipart
- **Email**: SendGrid

## Project Structure

```
jobsearch-app/
├── frontend/                 # React/TypeScript frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── context/          # React context providers
│   │   ├── styles/           # CSS and Tailwind styles
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── public/               # Static assets
│   ├── index.html            # HTML template
│   ├── package.json          # NPM dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   └── tailwind.config.js    # Tailwind CSS configuration
│
├── backend/                  # Python FastAPI backend
│   ├── main.py               # Main API entry point
│   ├── job_search_agent.py   # Job search functionality
│   ├── interview_prep_agent.py # Interview prep functionality
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
│
└── user_documentation.md     # User documentation
```

## Frontend Components

### Core Components

#### App.tsx
The main application component that sets up routing and the user context provider.

```typescript
// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
// Component imports...

function App() {
  return (
    <UserProvider>
      <Router>
        {/* Routes and components */}
      </Router>
    </UserProvider>
  );
}
```

#### UserContext.tsx
Manages user state including login status, premium status, and usage limitations.

```typescript
// UserContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface UserContextType {
  isLoggedIn: boolean;
  isPremium: boolean;
  searchesRemaining: number;
  interviewPrepsRemaining: number;
  // Methods...
}

export const UserProvider: React.FC = ({ children }) => {
  // State and methods implementation
};
```

### Feature Components

#### JobSearch.tsx
Handles the job search workflow including resume upload, preferences, and results display.

```typescript
// JobSearch.tsx
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
// Other imports...

const JobSearch: React.FC = () => {
  // Component implementation with steps:
  // 1. Resume upload
  // 2. Job preferences
  // 3. Results display
};
```

#### InterviewPrep.tsx
Manages the interview preparation workflow including resume upload, job details, and preparation materials.

```typescript
// InterviewPrep.tsx
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
// Other imports...

const InterviewPrep: React.FC = () => {
  // Component implementation with steps:
  // 1. Resume upload
  // 2. Job details
  // 3. Preparation materials
  // 4. Mock interview (premium)
};
```

### UI Components

- **Navbar.tsx**: Navigation and user status display
- **JobCard.tsx**: Display job listings with match scores
- **QuestionCard.tsx**: Display interview questions and answers
- **PremiumUpsell.tsx**: Promote premium features
- **UpgradeModal.tsx**: Handle premium upgrades
- **LoadingSpinner.tsx**: Show loading states

## Backend API

### Main API (main.py)

The main FastAPI application that defines all API endpoints.

```python
# main.py
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from job_search_agent import JobSearchAgent
from interview_prep_agent import InterviewPrepAgent
# Other imports...

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API endpoints
@app.post("/api/job-search")
async def search_jobs(job_preferences: dict, resume_text: str):
    # Implementation...

@app.post("/api/interview-prep")
async def prepare_interview(job_description: str, resume_text: str, company_name: str = "", industry: str = ""):
    # Implementation...

@app.post("/api/mock-interview")
async def mock_interview(previous_question: str, candidate_answer: str, job_description: str, resume_text: str, company_name: str = ""):
    # Implementation...
```

### Job Search Agent (job_search_agent.py)

Handles job search functionality using LangChain and OpenAI.

```python
# job_search_agent.py
from langchain.utilities import SerpAPIWrapper
from langchain.llms import OpenAI
# Other imports...

class JobSearchAgent:
    def __init__(self, openai_api_key):
        self.llm = OpenAI(openai_api_key=openai_api_key)
        self.search = SerpAPIWrapper()
        
    def search_jobs(self, job_preferences, resume_text):
        # Implementation...
        
    def analyze_job_match(self, job_description, resume_text):
        # Implementation...
```

### Interview Prep Agent (interview_prep_agent.py)

Handles interview preparation functionality using OpenAI.

```python
# interview_prep_agent.py
from langchain.llms import OpenAI
# Other imports...

class InterviewPrepAgent:
    def __init__(self, openai_api_key):
        self.llm = OpenAI(openai_api_key=openai_api_key)
        
    def generate_interview_prep(self, job_description, resume_text, company_name="", industry=""):
        # Implementation...
        
    def generate_mock_interview_feedback(self, previous_question, candidate_answer, job_description, resume_text):
        # Implementation...
```

## Environment Setup

### Frontend

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

### Backend

1. Create Python virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables in `.env` file:
```
OPENAI_API_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_key
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=your_email@example.com
```

4. Start the backend server:
```bash
python main.py
```

## Freemium Model Implementation

The freemium model is implemented using the UserContext provider on the frontend and API limitations on the backend.

### Frontend Implementation

```typescript
// UserContext.tsx
export const UserProvider: React.FC = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState(1);
  const [interviewPrepsRemaining, setInterviewPrepsRemaining] = useState(1);
  
  // Methods to manage usage and premium status
};
```

### Backend Implementation

```python
# main.py
@app.post("/api/job-search")
async def search_jobs(job_preferences: dict, resume_text: str, is_premium: bool = False):
    agent = JobSearchAgent(openai_api_key)
    results = agent.search_jobs(job_preferences, resume_text)
    
    # Limit results for free users
    if not is_premium:
        results["job_listings"] = results["job_listings"][:2]
        results["premium_required"] = True
    
    return results
```

## Performance Optimization

### Frontend Optimizations

1. **Code Splitting**: React Router handles code splitting by default, loading only the components needed for the current route.

2. **Lazy Loading**: Components can be lazy-loaded using React.lazy and Suspense:
```typescript
const InterviewPrep = React.lazy(() => import('./components/InterviewPrep'));
```

3. **Memoization**: Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders.

### Backend Optimizations

1. **Caching**: Implement caching for API responses to reduce OpenAI API calls.

2. **Asynchronous Processing**: Use FastAPI's async capabilities for non-blocking operations.

3. **Rate Limiting**: Implement rate limiting to prevent abuse of the API.

## Deployment

### Frontend Deployment

The frontend can be built for production using:
```bash
cd frontend
npm run build
```

This generates static files in the `dist` directory that can be served by any static file server.

### Backend Deployment

The backend can be deployed using a WSGI server like Uvicorn or Gunicorn:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

For production, consider using a process manager like Supervisor or PM2.

## Security Considerations

1. **API Keys**: Never expose API keys in the frontend code. All API calls should be proxied through the backend.

2. **CORS**: Configure CORS properly in production to only allow requests from trusted domains.

3. **Input Validation**: Validate all user inputs on both frontend and backend.

4. **Rate Limiting**: Implement rate limiting to prevent abuse of the API.

5. **Authentication**: Implement proper authentication for user accounts.

## Future Enhancements

1. **User Authentication**: Implement a proper authentication system with JWT tokens.

2. **Payment Processing**: Integrate with a payment processor like Stripe for premium subscriptions.

3. **Resume Parsing**: Improve resume parsing capabilities to extract more detailed information.

4. **Job Application Tracking**: Add functionality to track job applications.

5. **Email Notifications**: Send email notifications for new job matches and application updates.
