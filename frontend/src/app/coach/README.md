# 🦈 School of Sharks - Coach Dashboard

## Overview
The Coach Dashboard (`/coach`) is a comprehensive coaching interface designed for cycling coaches to manage their athletes and monitor training progress. This page follows the School of Sharks brand guidelines with an energetic, shark-themed design using ocean blue gradients.

## Features

### 🏆 Coach Statistics
- **Total Athletes**: Number of athletes under coaching
- **Active Workouts**: Currently in-progress training sessions
- **Completed This Week**: Workouts finished in the current week
- Real-time updates with gradient card animations

### 👥 Athlete Management
- **Searchable Athlete List**: Filter by name, username, or email
- **Athlete Profiles**: Comprehensive view of athlete information
- **Fitness Level Indicators**: Color-coded experience levels (beginner to pro)
- **Performance Metrics**: FTP, heart rate zones, physical stats

### 📅 Workout Calendar
- **Multiple Views**: Month, week, and day calendar views
- **Workout Status Tracking**: Planned, in-progress, completed, missed, skipped
- **Interactive Calendar**: Click dates to view workouts
- **Workout Details Modal**: Complete workout information and notes

### 📊 Training Insights
- **Workout Types**: Categorized by training zones (threshold, VO2max, endurance, etc.)
- **Progress Monitoring**: Target vs actual performance metrics
- **Coach Notes**: Training instructions and feedback
- **Athlete Notes**: Personal workout feedback

## Technical Implementation

### 🌐 Internationalization Support
- Full English and Thai language support
- Dynamic translations for all UI elements
- Professional Thai translations for cycling terminology

### 🎨 Design System
- **Theme**: High-tech shark/ocean aesthetic
- **Colors**: Ocean blues (#101a23 background, blue/cyan gradients)
- **Typography**: Modern font hierarchy with proper contrast
- **Responsive**: Desktop and mobile-optimized layouts

### 🔧 Component Architecture

```
/coach/
├── page.tsx                 # Main coach dashboard page
└── components/
    ├── CoachStats.tsx       # Statistics cards
    ├── AthleteSelector.tsx  # Searchable athlete dropdown
    ├── AthleteProfile.tsx   # Detailed athlete information
    └── WorkoutCalendar.tsx  # Interactive calendar component
```

### 📱 Responsive Features
- **Mobile Navigation**: Integrated with bottom navigation bar
- **Touch-Friendly**: Optimized for tablet coaching interfaces
- **Loading States**: Skeleton loaders for data fetching
- **Error Handling**: Graceful fallbacks for network issues

## Data Structure

### Athlete Interface
```typescript
interface Athlete {
  id: number;
  uuid: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  ftp?: number;
  maxHeartRate?: number;
  restHeartRate?: number;
  weight?: number;
  height?: number;
  lastActivity?: string;
  joinedDate: string;
}
```

### Workout Session Interface
```typescript
interface WorkoutSession {
  id: number;
  date: string;
  name: string;
  type: 'threshold' | 'vo2max' | 'endurance' | 'sprint' | 'recovery';
  status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'skipped';
  duration?: number;
  targetPower?: number;
  actualPower?: number;
  targetHeartRate?: number;
  actualHeartRate?: number;
  notes?: string;
  coachNotes?: string;
}
```

## Usage Instructions

### 1. Access Coach Dashboard
- Navigate to `/coach` or click the shark icon in bottom navigation
- Requires authentication (redirects to `/auth` if not logged in)

### 2. Select an Athlete
- Use the search bar to find athletes by name, username, or email
- Click on an athlete to select them
- View their profile information in the left panel

### 3. View Training Calendar
- Switch between month, week, and day views
- Navigate between dates using arrow buttons
- Click on calendar dates to see workouts for that day
- Click on workout cards to view detailed information

### 4. Manage Workouts
- View workout status with color-coded indicators
- Read coach notes and athlete feedback
- Access edit and remove workout options (TODO: Backend integration)

## Future Enhancements

### 🔗 API Integration
- Connect to backend endpoints for real athlete data
- Implement workout CRUD operations
- Real-time updates using WebSocket connections

### 🤖 AI Features
- Performance trend analysis
- Automated workout recommendations
- Training load optimization

### 📈 Advanced Analytics
- Power curve analysis
- Training stress score tracking
- Comparative performance metrics

### 💬 Communication Tools
- In-app messaging system
- Workout feedback collection
- Video analysis integration

## Development Notes

### Mock Data
Currently uses mock data for demonstration:
- 3 sample athletes with realistic cycling profiles
- Sample workouts with various types and statuses
- Realistic performance metrics (FTP, heart rate, etc.)

### Styling Guidelines
- Uses Tailwind CSS with custom School of Sharks color scheme
- Consistent hover effects and transitions
- Accessibility-compliant color contrasts
- Mobile-first responsive design

### Performance Optimizations
- Lazy loading for calendar components
- Efficient date calculations for calendar generation
- Memoized workout filtering for large datasets
- Optimized re-renders using React hooks

---

## 🦈 School of Sharks Development Team
Built with cutting-edge technology for the apex predators of cycling coaching.

*"Train like a shark, coach like a legend."* ⚡
