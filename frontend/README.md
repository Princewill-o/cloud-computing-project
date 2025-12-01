# Career Guidance Platform - Frontend

A modern React + TypeScript frontend for the AI-powered Career Guidance Platform, built with Tailwind CSS and featuring light/dark mode support.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for routing
- **TanStack Query (React Query)** for data fetching
- **Axios** for HTTP requests

## Features

- ✅ Light/Dark mode theme support
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Feature-based architecture (monolith-to-microservices ready)
- ✅ Authentication flow (login/register)
- ✅ Dashboard with career readiness metrics
- ✅ Opportunities browsing with filters
- ✅ Analytics dashboard
- ✅ Profile management
- ✅ Career questionnaire
- ✅ API integration layer

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Core app configuration
│   │   └── providers/          # Context providers (Theme, Auth)
│   │
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── dashboard/         # Dashboard
│   │   ├── opportunities/     # Opportunities browsing
│   │   ├── analytics/         # Analytics
│   │   └── profile/           # Profile management
│   │
│   ├── shared/                # Shared components & utilities
│   │   ├── components/ui/    # Reusable UI components
│   │   ├── utils/             # Utility functions
│   │   └── constants/         # Constants
│   │
│   ├── services/              # API client
│   ├── layouts/               # Page layouts
│   ├── routes/                # Routing configuration
│   └── styles/                # Global styles
│
├── API_ENDPOINTS.md           # Backend API documentation
├── WIREFRAMES_USER_FLOWS.md   # Design documentation
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Build

```bash
npm run build
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## API Integration

All API endpoints are documented in `API_ENDPOINTS.md`. The frontend is configured to connect to a FastAPI backend running on `http://localhost:8000` by default.

### Service Layer

Each feature module has a `services/` folder containing API service functions:

- `authService.ts` - Authentication endpoints
- `profileService.ts` - User profile and CV management
- `opportunitiesService.ts` - Job/internship/event recommendations
- `analyticsService.ts` - Analytics and market trends

### HTTP Client

The `httpClient` in `src/services/httpClient.ts` is configured with:
- Automatic token injection from localStorage
- Request/response interceptors
- Error handling (401 redirects to login)

## Theme System

The app supports light and dark modes with automatic system preference detection. The theme is managed by `ThemeProvider` and can be toggled using the `ThemeToggle` component.

### Using Theme in Components

```tsx
import { useTheme } from "../app/providers/ThemeProvider";

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  // theme is "light" | "dark"
}
```

### Theme Colors

Theme colors are defined in `src/styles/index.css` using CSS variables:
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--border-color`, `--border-hover`

## Components

### UI Components

Located in `src/shared/components/ui/`:

- `Button` - Button with variants (primary, secondary, outline, ghost, danger)
- `Input` - Form input with label and error handling
- `Card` - Card container with header, title, description, content
- `ThemeToggle` - Theme switcher button

### Usage Example

```tsx
import { Button } from "../../shared/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../shared/components/ui/Card";

function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="primary">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Routing

Routes are defined in `src/routes/AppRoutes.tsx`:

- `/login` - Login page
- `/register` - Registration page
- `/` - Dashboard (protected)
- `/opportunities` - Opportunities list (protected)
- `/analytics` - Analytics dashboard (protected)
- `/questionnaire` - Career questionnaire (protected)
- `/profile` - Profile management (protected)

Protected routes require authentication and redirect to `/login` if not authenticated.

## Data Fetching

The app uses TanStack Query (React Query) for data fetching:

```tsx
import { useQuery } from "@tanstack/react-query";
import { opportunitiesService } from "../services/opportunitiesService";

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => opportunitiesService.getOpportunities(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* render data */}</div>;
}
```

## Architecture Notes

The frontend follows a **monolith-to-microservices** architecture pattern:

- Features are self-contained modules with their own components, hooks, services, and pages
- Each feature can be independently developed and tested
- The structure allows for easy extraction into separate microservices later
- Shared code is in the `shared/` directory

## Next Steps

1. **Backend Integration**: Connect to the FastAPI backend (see `API_ENDPOINTS.md`)
2. **CV Upload**: Implement file upload UI for CV analysis
3. **Charts**: Add charting library (e.g., Recharts) for analytics visualizations
4. **Maps**: Integrate Google Maps API for regional insights
5. **Notifications**: Implement real-time notifications system
6. **Testing**: Add unit and integration tests

## Documentation

- `API_ENDPOINTS.md` - Complete API endpoint documentation
- `WIREFRAMES_USER_FLOWS.md` - User flows and wireframe descriptions

## License

Part of the Cloud Computing Project (Group G3)

