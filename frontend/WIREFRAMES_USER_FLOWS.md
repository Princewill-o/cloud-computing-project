# Wireframes & User Flows Documentation

## Architecture Overview

Following the **monolith-to-microservices** pattern, the frontend is organized into feature-based modules that can be independently developed and potentially split into microservices later.

## Folder Structure

```
frontend/
├── src/
│   ├── app/                    # Core app configuration
│   │   ├── providers/          # Context providers (Theme, Auth, Query)
│   │   └── store/              # Global state management
│   │
│   ├── features/               # Feature modules (microservices-ready)
│   │   ├── auth/               # Authentication module
│   │   │   ├── components/     # Auth-specific components
│   │   │   ├── hooks/          # useAuth, useLogin, etc.
│   │   │   ├── services/       # Auth API services
│   │   │   ├── types/          # Auth TypeScript types
│   │   │   └── pages/          # Login, Register pages
│   │   │
│   │   ├── dashboard/          # Dashboard module
│   │   │   ├── components/     # Dashboard widgets, cards
│   │   │   ├── hooks/          # useDashboard, useMetrics
│   │   │   ├── services/       # Dashboard API services
│   │   │   └── pages/          # Dashboard page
│   │   │
│   │   ├── opportunities/      # Opportunities module
│   │   │   ├── components/     # Opportunity cards, filters
│   │   │   ├── hooks/          # useOpportunities, useFilters
│   │   │   ├── services/       # Opportunities API services
│   │   │   └── pages/          # Opportunities list, detail pages
│   │   │
│   │   ├── analytics/           # Analytics module
│   │   │   ├── components/     # Charts, metrics displays
│   │   │   ├── hooks/          # useAnalytics, useMarketTrends
│   │   │   ├── services/       # Analytics API services
│   │   │   └── pages/          # Analytics dashboard
│   │   │
│   │   ├── profile/             # Profile module
│   │   │   ├── components/     # Profile forms, CV upload
│   │   │   ├── hooks/          # useProfile, useCV
│   │   │   ├── services/       # Profile API services
│   │   │   └── pages/          # Profile, Questionnaire pages
│   │   │
│   │   └── regional/            # Regional insights module
│   │       ├── components/     # Map components, location filters
│   │       ├── hooks/          # useRegional, useMap
│   │       ├── services/       # Regional API services
│   │       └── pages/          # Regional insights page
│   │
│   ├── shared/                  # Shared across features
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Base components (Button, Input, Card)
│   │   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   │   └── feedback/        # Loading, Error, Empty states
│   │   ├── hooks/               # Shared hooks
│   │   ├── utils/               # Utility functions
│   │   ├── types/               # Shared TypeScript types
│   │   └── constants/           # Constants and config
│   │
│   ├── services/                # API client configuration
│   │   ├── api/                 # API service layer
│   │   ├── httpClient.ts        # Axios instance
│   │   └── interceptors.ts      # Request/response interceptors
│   │
│   ├── layouts/                 # Page layouts
│   │   ├── AuthLayout.tsx       # Login/Register layout
│   │   ├── MainLayout.tsx       # Main app layout with sidebar
│   │   └── DashboardLayout.tsx  # Dashboard-specific layout
│   │
│   ├── routes/                  # Routing configuration
│   │   ├── AppRoutes.tsx        # Route definitions
│   │   └── ProtectedRoute.tsx  # Route guards
│   │
│   ├── styles/                  # Global styles
│   │   ├── index.css            # Tailwind imports
│   │   └── themes.css           # Theme variables
│   │
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
│
├── public/                      # Static assets
└── package.json
```

## User Flows

### 1. Authentication Flow

```
[Landing/Login Page]
    ↓
[User enters email/password]
    ↓
[POST /auth/login]
    ↓
[Store tokens, redirect to Dashboard]
    ↓
[Dashboard Page]
```

**Alternative: Registration Flow**
```
[Register Page]
    ↓
[User fills registration form]
    ↓
[POST /auth/register]
    ↓
[Auto-login, redirect to Questionnaire]
    ↓
[Complete profile setup]
    ↓
[Dashboard Page]
```

### 2. Onboarding Flow (New User)

```
[Login/Register]
    ↓
[Questionnaire Page]
    ├── Experience level selection
    ├── Career goals
    ├── Focus area (backend/frontend/fullstack)
    ├── Location preferences
    └── Interests
    ↓
[POST /users/me/questionnaire]
    ↓
[CV Upload Page (optional)]
    ├── Upload CV file
    └── [POST /users/me/cv/upload]
    ↓
[Processing CV analysis...]
    ↓
[Dashboard with initial recommendations]
```

### 3. Dashboard Flow

```
[Dashboard Page]
    ├── [GET /analytics/user-progress] → Display metrics
    ├── [GET /recommendations/opportunities?limit=5] → Top opportunities
    ├── [GET /recommendations/skill-gaps] → Skill gap analysis
    └── [GET /notifications?unread_only=true] → Recent notifications
    ↓
[User interacts with widgets]
    ├── Click "View All Opportunities" → Navigate to Opportunities page
    ├── Click "View Analytics" → Navigate to Analytics page
    ├── Click "Update Profile" → Navigate to Profile page
    └── Click notification → Navigate to related page
```

### 4. Opportunities Browsing Flow

```
[Opportunities Page]
    ↓
[GET /recommendations/opportunities]
    ├── Apply filters (type, location, skills)
    └── [GET /recommendations/opportunities?type=job&location=remote]
    ↓
[Display opportunity cards]
    ├── Match score badge
    ├── Required skills
    ├── Missing skills indicator
    └── Action buttons (Save, Apply, View Details)
    ↓
[User clicks "View Details"]
    ↓
[GET /opportunities/{opportunity_id}]
    ↓
[Opportunity Detail Modal/Page]
    ├── Full description
    ├── Skill match breakdown
    ├── Recommended courses to fill gaps
    └── Apply button → External link
```

### 5. Skill Gap Analysis Flow

```
[User views skill gaps section]
    ↓
[GET /recommendations/skill-gaps]
    ↓
[Display skill gaps]
    ├── Missing skill: "Docker"
    ├── Importance score: 0.9
    ├── Frequency in jobs: 75%
    └── Recommended courses
    ↓
[User clicks "View Courses"]
    ↓
[GET /recommendations/courses?skill_gap=Docker]
    ↓
[Display course recommendations]
    ├── Course title, provider
    ├── Duration, rating
    └── Link to course
```

### 6. Analytics Flow

```
[Analytics Page]
    ↓
[Multiple API calls in parallel]
    ├── [GET /analytics/user-progress] → User metrics
    ├── [GET /analytics/market-trends] → Market trends
    └── [GET /analytics/job-market] → Job market stats
    ↓
[Display analytics dashboard]
    ├── Readiness score chart
    ├── Skill growth over time
    ├── Trending skills visualization
    ├── Regional demand map
    └── Popular roles chart
```

### 7. Regional Insights Flow

```
[Regional Insights Page / Map View]
    ↓
[User allows location access OR enters location]
    ↓
[GET /regional/events?latitude=X&longitude=Y&radius_km=50]
    ↓
[Display map with event markers]
    ├── Hackathons
    ├── Workshops
    ├── Networking events
    └── Job locations (optional)
    ↓
[User clicks marker]
    ↓
[Display event details]
    ├── Event info
    ├── Match score
    ├── Distance
    └── Registration link
```

### 8. Profile Management Flow

```
[Profile Page]
    ↓
[GET /users/me] → Display current profile
    ↓
[User edits profile]
    ├── Update name, preferences
    └── [PUT /users/me]
    ↓
[CV Management Section]
    ├── [GET /users/me/cv] → Display current CV status
    ├── Upload new CV → [POST /users/me/cv/upload]
    └── Delete CV → [DELETE /users/me/cv]
    ↓
[Skills Section]
    ├── [GET /users/me/skills] → Display skills
    ├── Add/Edit skills → [POST /users/me/skills]
    └── Remove skills
```

## Wireframe Descriptions

### 1. Login/Register Page
- **Layout**: Split screen (left: branding, right: form)
- **Components**: 
  - Email/password inputs
  - Submit button
  - Link to register/login toggle
  - Theme toggle (light/dark mode)
- **Theme Support**: Full light/dark mode

### 2. Dashboard Page
- **Layout**: Main content area with sidebar navigation
- **Components**:
  - Header with user menu and theme toggle
  - Readiness score card (large, prominent)
  - Quick stats grid (applications, interviews, skill growth)
  - Top opportunities carousel/list
  - Skill gaps section with progress bars
  - Recent activity feed
- **Theme Support**: Full light/dark mode

### 3. Opportunities Page
- **Layout**: Two-column (filters sidebar + main list)
- **Components**:
  - Filter sidebar (type, location, skills, salary)
  - Search bar
  - Opportunity cards with:
    - Match score badge
    - Company/event name
    - Location
    - Required skills (with missing indicators)
    - Action buttons
  - Pagination
- **Theme Support**: Full light/dark mode

### 4. Analytics Page
- **Layout**: Grid of charts and metrics
- **Components**:
  - Readiness score gauge chart
  - Skill growth line chart
  - Trending skills bar chart
  - Regional demand map (Google Maps integration)
  - Market statistics cards
- **Theme Support**: Full light/dark mode (charts adapt)

### 5. Profile Page
- **Layout**: Tabbed interface
- **Tabs**:
  - Overview: Basic info, profile completeness
  - Skills: Skill list with levels, add/edit
  - CV: Upload/delete CV, view analysis
  - Questionnaire: Career questionnaire form
  - Preferences: Notification settings, theme
- **Theme Support**: Full light/dark mode

### 6. Regional Insights Page
- **Layout**: Map view with sidebar
- **Components**:
  - Google Maps integration
  - Event markers on map
  - Sidebar with event list
  - Filters (event type, date range, radius)
  - Event detail cards
- **Theme Support**: Full light/dark mode

## Component Integration Points

### API Integration Layer
Each feature module has a `services/` folder containing:
- API service functions (e.g., `authService.ts`, `opportunitiesService.ts`)
- Type definitions for API requests/responses
- Error handling
- Request/response transformation

### State Management
- React Query for server state (caching, refetching)
- Context API for global state (auth, theme)
- Local state for UI-only state

### Theme System
- Theme provider with light/dark mode
- CSS variables for colors
- Tailwind dark mode classes
- Chart libraries configured for theme

## Responsive Design

- **Mobile**: Single column, collapsible sidebar, stacked cards
- **Tablet**: Two-column layouts, sidebar as drawer
- **Desktop**: Full sidebar, multi-column grids, expanded views

