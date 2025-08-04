# Workout Components

This directory contains all the components specific to the workout/training calendar functionality.

## Components

### WorkoutMonthlySchedule
- **Purpose**: Displays a monthly calendar view of scheduled workouts
- **Features**: 
  - Interactive calendar with workout indicators
  - Color-coded status (completed, in-progress, assigned, etc.)
  - Priority indicators
  - Click to view workouts for specific dates
- **Props**: `userId`, `currentDate`, `onDateSelect`, `onMonthChange`

### WorkoutWeeklySchedule
- **Purpose**: Displays a weekly view of workouts with more detail
- **Features**:
  - Week-based navigation
  - Detailed workout cards
  - Status management (start, complete, skip)
  - Real-time workout tracking
- **Props**: `userId`, `currentWeekStart`, `onWeekChange`, `onWorkoutSelect`, `onWorkoutStart`

### WorkoutStructureGraph
- **Purpose**: Visualizes the structure and segments of a workout
- **Features**:
  - Graphical representation of workout intervals
  - Power/heart rate zones visualization
  - Interactive segment details
  - Duration and intensity indicators
- **Props**: `workoutId`, `segments`, `displayMode`

## Shared Components

### WorkoutDetailModal
- **Location**: `/src/components/WorkoutDetailModal.tsx`
- **Purpose**: Shows detailed information about a selected workout (shared between coach and workout pages)
- **Features**:
  - Complete workout information display
  - Action buttons (start, complete, edit)
  - Progress tracking
  - Notes and feedback sections
  - Workout structure visualization
- **Props**: `workout`, `isOpen`, `onClose`, `onStartWorkout`, `onCompleteWorkout`

## File Structure
```
workout/
├── components/
│   ├── index.ts              # Central export file
│   ├── WorkoutMonthlySchedule.tsx
│   ├── WorkoutWeeklySchedule.tsx
│   ├── WorkoutDetailModal.tsx
│   └── README.md             # This file
└── page.tsx                  # Main workout page
```

## Usage

### Import individual components:
```tsx
import WorkoutMonthlySchedule from './components/WorkoutMonthlySchedule';
```

### Import multiple components (recommended):
```tsx
import { WorkoutMonthlySchedule, WorkoutWeeklySchedule } from './components';
```

## Dependencies
- `@/types/workout` - TypeScript interfaces for workout data
- `@/services/workoutService` - API service for workout operations
- React hooks for state management and performance optimization
