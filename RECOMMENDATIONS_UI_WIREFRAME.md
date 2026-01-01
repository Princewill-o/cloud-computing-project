# Job Recommendations UI - Wireframe & Design

## 📱 Page Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Job Recommendations                    [Update Profile] [⚙️]  │
│ AI-powered job matches based on your skills and preferences     │
├─────────────────────────────────────────────────────────────────┤
│ [🔍 Search jobs, companies, skills...] 📊 125 opportunities ✅Live│
├─────────────────────────────────────────────────────────────────┤
│ FILTERS (Left Sidebar)    │ JOB CARDS (Main Content)            │
│ ┌─────────────────────┐   │ ┌─────────────────────────────────┐ │
│ │ 🔧 Filters          │   │ │ Senior Full Stack Developer     │ │
│ │ Sort by: [Best ▼]   │   │ │ TechFlow Solutions • SF, CA     │ │
│ │                     │   │ │ 🌍 Remote • Senior • 💰$120K-160K│ │
│ │ ☑️ Jobs             │   │ │ ─────────────────────────────── │ │
│ │ ☑️ Internships      │   │ │ Join our innovative team...     │ │
│ │ ☐ Hackathons        │   │ │ ─────────────────────────────── │ │
│ │ ☐ Workshops         │   │ │ React TypeScript AWS Docker     │ │
│ │                     │   │ │ ✅✅❌❌                          │ │
│ │ Location: [Remote]  │   │ │ ⚠️ Missing 2 required skills    │ │
│ │ Skills: [Python,..] │   │ │ [Apply Now] [💖 Save] 92% match │ │
│ │                     │   │ │ 🏢 50-200 employees • 2 days ago│ │
│ │ [Clear All Filters] │   │ └─────────────────────────────────┘ │
│ └─────────────────────┘   │                                   │ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Visual Design Elements

### Header Section
- **Title**: "🎯 Job Recommendations" with emoji for visual appeal
- **Subtitle**: "AI-powered job matches based on your skills and preferences"
- **Action Buttons**: "Update Profile" and "Adjust Preferences" buttons
- **Search Bar**: Full-width search with placeholder text
- **Stats Bar**: Shows total opportunities found and "Live Data" indicator

### Filters Sidebar (Left)
- **Sort Options**: Dropdown with "Best Match", "Most Recent", "Highest Salary"
- **Opportunity Types**: Checkboxes for Jobs, Internships, Hackathons, Workshops
- **Location Filter**: Text input for location preferences
- **Skills Filter**: Text input for comma-separated skills
- **Clear Filters**: Button to reset all filters

### Job Cards (Main Content)
Each job card displays:

#### Header
- **Job Title**: Large, bold text (e.g., "Senior Full Stack Developer")
- **Company & Location**: "TechFlow Solutions • San Francisco, CA"
- **Tags**: Remote-friendly 🌍, Experience level, Salary range 💰

#### Content
- **Description**: Brief job description (2-3 lines)
- **Skills Section**: 
  - Required skills as colored badges
  - ✅ Green for skills you have
  - ❌ Red for missing skills
  - Warning message for missing skills count

#### Footer
- **Actions**: "Apply Now" (primary button), "Save" (secondary button)
- **Match Score**: Colored badge showing percentage match
- **Metadata**: Company size, posting date

## 🎯 Match Score Color Coding

- **90-100%**: 🟢 Green (Excellent match)
- **80-89%**: 🔵 Blue (Good match)  
- **70-79%**: 🟡 Yellow (Fair match)
- **Below 70%**: ⚪ Gray (Poor match)

## 📊 Skills Visualization

```
Required Skills: [React] [TypeScript] [AWS] [Docker]
Your Skills:     [✅]    [✅]        [❌]   [❌]
Status:          Have    Have        Need   Need
```

## 🔍 Search & Filter Flow

1. **User enters search query** → Updates job list in real-time
2. **User selects filters** → Refines results based on criteria
3. **User sorts results** → Reorders by match score, date, or salary
4. **External API integration** → Shows "Live Data" indicator when using real APIs

## 📱 Responsive Design

### Desktop (1200px+)
- Sidebar: 25% width
- Main content: 75% width
- 2-3 job cards per row

### Tablet (768px-1199px)
- Sidebar: 30% width
- Main content: 70% width
- 1-2 job cards per row

### Mobile (< 768px)
- Sidebar collapses to dropdown/modal
- Main content: 100% width
- 1 job card per row
- Simplified card layout

## 🎨 Color Scheme (Dark Mode)

- **Background**: True black (#000000)
- **Cards**: Dark gray (#111111)
- **Text Primary**: White (#FFFFFF)
- **Text Secondary**: Light gray (#CCCCCC)
- **Accent**: Brand blue (#06B6D4)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

## 🚀 Interactive Features

- **Hover Effects**: Cards lift slightly on hover
- **Loading States**: Skeleton loaders while fetching data
- **Empty States**: Friendly message when no results found
- **Error States**: Clear error messages with retry options
- **Real-time Updates**: Live data indicators and refresh capabilities

## 📈 Data Sources Indicator

```
┌─────────────────────────────────────┐
│ 📊 125 opportunities found          │
│ ✅ Live Data  🔄 Updated 2 min ago   │
│ Sources: Internal DB + Adzuna API   │
└─────────────────────────────────────┘
```

This wireframe provides a comprehensive view of how users will interact with the job recommendations feature, making it easy to discover, filter, and apply for relevant opportunities.