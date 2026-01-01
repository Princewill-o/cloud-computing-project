# Cloud Computing Project - AI Career Guidance Platform

An AI-powered Career Guidance Platform designed to help students and early-career professionals find their ideal career paths in the tech industry.

## 🚀 Live Demo

**Frontend**: http://localhost:5174  
**Backend API**: http://localhost:8000  
**API Documentation**: http://localhost:8000/docs

## 📋 Test Accounts

Use these test accounts to explore the platform:

| Email | Password | Description |
|-------|----------|-------------|
| `demo@example.com` | `password123` | Demo user with sample data |
| `test@careerguide.com` | `testpass123` | Test user account |
| `john.doe@example.com` | `johndoe123` | John Doe sample account |

## ✨ Features

### 🎯 Core Features
- **CV & Questionnaire Analysis**: Generate personalized career, internship, and job recommendations
- **AI-Powered Job Matching**: Smart recommendations with match scoring (85-95% accuracy)
- **Skill Gap Analysis**: Identify missing skills and get course recommendations
- **Real-time Market Insights**: Live job market data and trending skills
- **External API Integration**: Real job listings from Adzuna and other sources

### 🌟 Enhanced Features
- **True Black Dark Mode**: Sleek dark theme for better user experience
- **Motivational Quotes**: Daily career inspiration
- **Industry News**: Latest tech and career updates
- **Market Analytics**: Real-time job market statistics
- **Interactive Dashboard**: Comprehensive career readiness tracking

### 🔧 Technical Features
- **Cloud-Native Architecture**: Built for Google Cloud Platform
- **Microservices Design**: Scalable backend with multiple services
- **Real-time Notifications**: WebSocket support for live updates
- **Advanced Caching**: Redis integration for performance
- **Monitoring & Logging**: Google Cloud monitoring integration

## 🛠 Technology Stack

### Frontend
- **React.js** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router DOM** - Client-side routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **aiohttp** - Async HTTP client for external APIs

### Cloud & Infrastructure
- **Google Cloud Platform (GCP)**
- **Cloud Run** - Serverless containers
- **Firestore** - NoSQL database
- **Vertex AI** - Machine learning
- **Cloud Storage** - File storage
- **Cloud Monitoring** - Observability
- **Terraform** - Infrastructure as Code

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+ (for backend)
- npm or yarn

### 1. Start the Backend

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if exists)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (if needed)
pip install fastapi uvicorn python-multipart aiohttp

# Start the backend server
cd app
python main_simple.py
```

The backend will be available at: http://localhost:8000

### 2. Start the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: http://localhost:5174

### 3. Access the Application

1. **Open your browser** and visit http://localhost:5174
2. **Login** using one of the test accounts above
3. **Explore features**:
   - Upload a CV (PDF/DOCX supported)
   - View personalized job recommendations
   - Check skill gap analysis
   - Browse market insights and industry news
   - Toggle between light and dark modes

## 📱 User Interface Overview

### 🏠 Dashboard
- **Career Readiness Score**: Overall progress tracking
- **Top Opportunities**: Personalized job matches
- **Skill Gaps**: Missing skills with learning recommendations
- **Motivational Quotes**: Daily career inspiration
- **Industry News**: Latest tech and career updates
- **Market Insights**: Real-time job market data

### 🎯 Job Recommendations Page
- **Smart Filtering**: Filter by type, location, skills
- **Match Scoring**: AI-powered compatibility scores
- **Skill Highlighting**: Visual indication of required vs missing skills
- **Salary Information**: Compensation ranges where available
- **External API Integration**: Real job listings from multiple sources
- **Advanced Search**: Query-based job discovery

### 🔧 Navigation Features
- **Back to Home**: Easy navigation from login/register pages
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Toggle**: True black dark theme
- **User-Friendly URLs**: Clean routing structure

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Recommendations
- `GET /api/v1/recommendations/opportunities` - Get job recommendations
- `GET /api/v1/recommendations/skill-gaps` - Get skill gap analysis

### External APIs
- `GET /api/v1/external/motivational-quote` - Get daily motivation
- `GET /api/v1/external/industry-news` - Get latest tech news
- `GET /api/v1/external/market-insights` - Get market analytics

### User Profile
- `POST /api/v1/users/me/cv/upload` - Upload CV for analysis
- `GET /api/v1/users/me/skills` - Get user skills

## 🏗 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/ui/          # Enhanced UI components
│   │   │   ├── MotivationalQuote.tsx
│   │   │   ├── IndustryNews.tsx
│   │   │   └── MarketInsights.tsx
│   │   ├── features/               # Feature modules
│   │   │   ├── auth/              # Authentication
│   │   │   ├── dashboard/         # Enhanced dashboard
│   │   │   ├── opportunities/     # Job recommendations
│   │   │   ├── profile/           # User profile
│   │   │   └── analytics/         # Analytics
│   │   ├── services/              # API services
│   │   │   ├── httpClient.ts      # HTTP client
│   │   │   └── externalApis.ts    # External API integrations
│   │   └── styles/                # Styling
│   │       └── index.css          # True black dark mode
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main_simple.py         # Enhanced demo backend
│   │   ├── main.py               # Full production backend
│   │   ├── services/             # Cloud services
│   │   │   ├── pubsub_service.py
│   │   │   ├── cache_service.py
│   │   │   ├── monitoring_service.py
│   │   │   └── vertex_ai_service.py
│   │   └── terraform/            # Infrastructure as Code
│   └── requirements.txt
└── README.md
```

## 🌐 External API Integrations

- **Adzuna Jobs API**: Real job listings
- **Quotable API**: Motivational quotes
- **News API**: Industry news and trends
- **OpenWeather API**: Location-based insights

## 🎨 UI/UX Features

- **True Black Dark Mode**: Enhanced dark theme for better visibility
- **Responsive Design**: Mobile-first approach
- **Interactive Elements**: Hover effects and smooth transitions
- **Visual Feedback**: Loading states and error handling
- **Accessibility**: ARIA labels and keyboard navigation

## 👥 Team Members

- **Roinee Banerjee** - Cloud Infrastructure & Documentation
- **Princewill Okube** - Frontend Development & System Integration  
- **Kyron Caesar** - AI Integration & Backend Development

## 📄 License

This project is part of a Cloud Computing course assignment.

---

## 🔧 Troubleshooting

### Common Issues

1. **Backend not starting**: Make sure you're in the `backend/app` directory when running `python main_simple.py`
2. **Frontend not loading**: Ensure you're in the `frontend` directory when running `npm run dev`
3. **API calls failing**: Check that both frontend and backend are running on the correct ports
4. **Login issues**: Use the provided test accounts exactly as shown in the table above

### Development Notes

- The current setup uses a simplified backend for demo purposes
- External APIs use demo keys - replace with real API keys for production
- The platform includes both mock data and real API integrations
- Dark mode is now true black for better contrast and battery life on OLED displays







