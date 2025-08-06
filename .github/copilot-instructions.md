# Copilot Instructions for School of Sharks AI Cycling Platform

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack "School of Sharks" AI cycling training platform consisting of:

### Frontend (`/frontend`)
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for modern, responsive styling
- **Shark/Ocean Theme** with blue gradient designs and energetic UI

### Backend (`/backend`)
- **Node.js + Express** RESTful API
- **TypeScript** for type safety
- **PostgreSQL** database integration, database name is 'school_of_sharks'
- **External PostgreSQL Database** - Uses external PostgreSQL server for both development and production environments
- **Security middleware** (Helmet, CORS, etc.)

## Project Architecture & Structure

### Frontend Architecture (`/frontend/src/`)
```
frontend/src/
├── app/                    # Next.js 15 App Router pages and layouts
│   ├── api/               # API route handlers (proxy to backend)
│   │   ├── activities/    # Activities API proxy routes
│   │   ├── auth/         # Authentication API routes
│   │   ├── coach/        # Coach-specific API routes
│   │   └── workout-library/ # Workout library API routes
│   ├── auth/             # Authentication pages (login, signup)
│   ├── coach/            # Coach dashboard and athlete management
│   ├── dashboard/        # User dashboard and main interface
│   ├── profile/          # User profile management
│   ├── videos/           # Video streaming and workout content
│   └── workout/          # Workout planning and execution
├── components/           # Shared React components
│   ├── EnhancedWeeklySchedule.tsx    # Advanced weekly calendar
│   ├── EnhancedMonthlySchedule.tsx   # Advanced monthly calendar
│   └── ActivityCalendarDay.tsx       # Calendar day component
├── contexts/             # React Context providers
├── services/             # Frontend service layer
│   ├── activitiesService.ts          # Activities data management
│   └── workoutService.ts             # Workout data management
├── types/                # TypeScript type definitions
├── utils/                # Utility functions and helpers
└── lib/                  # Third-party library configurations
```

### Backend Architecture (`/backend/src/`)
```
backend/src/
├── routes/               # API route definitions
│   ├── activities.ts     # Activities CRUD and intervals.icu integration
│   ├── auth.ts          # Authentication and session management
│   ├── coach.ts         # Coach dashboard and athlete management
│   ├── cycling.ts       # Cycling session data and analytics
│   ├── training.ts      # AI training programs and recommendations
│   ├── users.ts         # User profile and account management
│   └── workoutLibrary.ts # Workout library and assignments
├── controllers/          # Business logic controllers
├── middleware/           # Express middleware (auth, validation, security)
├── models/              # Database models and TypeScript interfaces
│   ├── types.ts         # Main TypeScript type definitions
│   ├── schema.sql       # PostgreSQL database schema
│   └── UserModel.ts     # User model with database operations
├── services/            # Service layer for business logic
├── config/              # Configuration files and environment setup
├── migrations/          # Database migration scripts
└── utils/               # Backend utility functions
```

### Database Schema Overview
```
PostgreSQL Database: school_of_sharks
├── users                # User accounts and profiles
├── activities          # Cycling activities from intervals.icu
├── workout_library      # Available workout templates
├── workout_categories   # Workout categorization
├── workout_segments     # Individual workout components
├── workout_assignments  # Assigned workouts to users
├── cycling_sessions     # Completed cycling sessions
└── training_programs    # AI-generated training plans
```

## API Architecture & Data Flow

### Frontend-Backend Communication
1. **Frontend API Routes** (`/app/api/`) - Next.js API routes that proxy requests to backend
2. **Backend REST API** (`backend:5001/api/`) - Express.js RESTful API
3. **External Services** - intervals.icu integration for activity data

### API Endpoint Structure
```
Base URLs:
- Frontend: http://localhost:3000/api/* (proxies to backend)
- Backend: http://localhost:5001/api/*

Endpoints:
├── /auth/*              # Authentication and session management
├── /users/*             # User profile and account operations
├── /activities/*        # Activities data and intervals.icu sync
├── /coach/*             # Coach dashboard and athlete management
├── /cycling/*           # Cycling session data and analytics
├── /training/*          # AI training programs and recommendations
└── /workout-library/*   # Workout library and assignment system
```

### Data Flow Patterns
1. **Client Request** → Frontend API Route → Backend REST API → PostgreSQL
2. **External Data** → intervals.icu API → Backend Service → Database → Frontend
3. **Real-time Updates** → WebSocket connections (planned) → Live coaching features

## Key Services & Integrations

### Activities Service
- **Purpose**: Manage cycling activity data from intervals.icu
- **Frontend**: `activitiesService.ts` - Data fetching and caching
- **Backend**: `routes/activities.ts` - API endpoints and database operations
- **Integration**: intervals.icu API for importing external activity data

### Workout Service
- **Purpose**: Manage workout library, assignments, and planning
- **Frontend**: `workoutService.ts` - Workout data management and calendar integration
- **Backend**: `routes/workoutLibrary.ts` - Workout CRUD operations and assignment logic
- **Features**: Workout templates, scheduling, progress tracking

### Authentication System
- **Frontend**: Next.js middleware and auth pages
- **Backend**: JWT-based authentication with session management
- **Database**: User accounts with secure password hashing
- **Test Credentials**: `testing@only.com` / `test1234`

## Enhanced Calendar System

### Calendar Components
- **EnhancedWeeklySchedule**: Advanced weekly view with activities and workouts
- **EnhancedMonthlySchedule**: Monthly calendar with activity aggregation
- **ActivityCalendarDay**: Individual day component with activity details

### Calendar Data Integration
1. **Activities**: Fetched from intervals.icu via backend API
2. **Workouts**: Managed through workout library assignment system
3. **Real-time Updates**: Automatic refresh and cache management
4. **Mobile Optimization**: Touch-friendly interface with responsive design

## Brand & Theme Guidelines
- **Theme**: High-tech, energetic, shark/predator-inspired
- **Colors**: Ocean blues, cyans, and gradients
- **Tone**: Motivational, competitive, cutting-edge
- **Design Focus**: Mobile-first responsive design with touch-friendly interfaces

## Development Guidelines

### General Guidelines
- **Layout Design Preservation** - Do not change existing layout designs unless explicitly requested by the user
- **Database Operations** - Use external PostgreSQL database for all data persistence operations

### Frontend Development
- Use TypeScript for all new files
- Follow Next.js App Router conventions (`frontend/src/app/`)
- Use Tailwind CSS classes for styling with blue/cyan theme
- **Mobile-First Responsive Design**: Always implement mobile-first layouts using Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
- **Touch-Friendly UI**: Ensure buttons and interactive elements have minimum 44px touch targets
- **Flexible Layouts**: Use CSS Grid and Flexbox for responsive layouts that adapt to different screen sizes
- **Typography**: Implement responsive text sizing and line heights for optimal mobile reading
- Use Server Components by default, Client Components when needed
- Create modern, energetic UI components with hover effects and animations

### Backend Development
- Use TypeScript for all API development
- Follow RESTful API conventions
- Use PostgreSQL for data persistence
- Implement proper error handling and validation
- Use the data models defined in `backend/src/models/types.ts`
- Structure routes in `backend/src/routes/`

### Database Integration
- Reference the schema in `backend/src/models/schema.sql`
- Use the TypeScript interfaces in `backend/src/models/types.ts`
- Implement proper foreign key relationships
- Consider performance with proper indexing
- **External Database** - All environments use external PostgreSQL server connections

## Mobile-First Design Guidelines

### Core Principles
- **Mobile-First Approach**: Design for mobile devices first, then enhance for larger screens
- **Touch-Friendly Interface**: All interactive elements must be easily tappable on mobile devices
- **Performance Optimized**: Fast loading times and smooth scrolling on mobile networks
- **Accessibility**: WCAG-compliant design with proper contrast ratios and screen reader support

### Mobile Layout Standards
- **Minimum Touch Targets**: 44px minimum size for buttons and interactive elements
- **Safe Areas**: Account for device-specific safe areas (notches, rounded corners)
- **Spacing**: Use consistent 8px grid system with adequate padding and margins
- **Navigation**: Implement bottom navigation for primary actions, easily reachable with thumbs

### Responsive Breakpoints
- **Mobile (Default)**: 0px - 639px (sm breakpoint)
- **Tablet**: 640px - 767px (sm: to md:)
- **Desktop**: 768px+ (md: and above)
- **Large Desktop**: 1024px+ (lg: and above)

### Mobile-Specific Components
- **Bottom Navigation**: Fixed bottom navigation for primary app navigation
- **Mobile Modals**: Full-screen or slide-up modals for mobile interactions
- **Swipe Gestures**: Support for swipe navigation where appropriate
- **Pull-to-Refresh**: Implement where data refreshing is needed

### Performance Guidelines
- **Image Optimization**: Use Next.js Image component with responsive sizes
- **Lazy Loading**: Implement lazy loading for non-critical content
- **Bundle Size**: Keep JavaScript bundles optimized for mobile networks
- **Caching**: Implement proper caching strategies for mobile performance

## API Endpoints Structure
Base URL: `http://localhost:5000/api`

- `/users` - User management and profiles
- `/cycling` - Cycling sessions and analytics
- `/training` - AI training programs and recommendations
- `/workout-library` - Workout library system for structured training

## Development Server Instructions
**IMPORTANT**: Always use the correct directory paths when running development servers:

### Backend Server
```bash
# Always run backend from the backend directory
cd /Users/kamhangenilkamhange/Desktop/coding/2025/soswebapp2/backend && npm run dev
```

### Frontend Server
```bash
# Always run frontend from the frontend directory
cd /Users/kamhangenilkamhange/Desktop/coding/2025/soswebapp2/frontend && npm run dev
```

### Database Operations
```bash
# PostgreSQL operations should be run from the backend directory
cd /Users/kamhangenilkamhange/Desktop/coding/2025/soswebapp2/backend
# Then run database scripts or migrations
```

**Note**: Never run `npm run dev` from the root `/soswebapp2` directory - always navigate to the specific service directory first.

## AI Development Workflow Guidelines

### Working with AI Assistants - Best Practices

#### 1. Understanding Project Context
Before making changes, AI should:
- **Examine Current Structure**: Use `list_dir`, `file_search`, and `semantic_search` to understand existing code
- **Read Related Files**: Use `read_file` to understand context and dependencies
- **Check for Existing Patterns**: Look for similar implementations in the codebase
- **Understand Data Flow**: Trace data from frontend → API routes → backend → database

#### 2. Making Changes Safely
- **Read Before Edit**: Always read existing files to understand current implementation
- **Preserve Existing Logic**: Don't change working code unless specifically requested
- **Follow Established Patterns**: Use existing code patterns and conventions
- **Test Changes**: Verify changes work by running development servers
- **Handle Dependencies**: Update related files when making structural changes

#### 3. Common Development Tasks

##### Adding New API Endpoints
1. **Backend**: Create route in `backend/src/routes/`
2. **Frontend**: Create proxy route in `frontend/src/app/api/`
3. **Types**: Update TypeScript interfaces in `backend/src/models/types.ts`
4. **Service**: Add service functions in `frontend/src/services/`
5. **Test**: Verify endpoint works with both servers running

##### Adding New Pages
1. **Page Structure**: Create in `frontend/src/app/[page-name]/`
2. **Components**: Add reusable components to `frontend/src/components/`
3. **Services**: Connect to backend APIs via service layer
4. **Styling**: Use Tailwind CSS with mobile-first approach
5. **Navigation**: Update navigation components and middleware

##### Database Changes
1. **Schema**: Update `backend/src/models/schema.sql`
2. **Types**: Update `backend/src/models/types.ts`
3. **Migration**: Create migration script if needed
4. **API Routes**: Update related API endpoints
5. **Frontend**: Update frontend types and services

#### 4. Debugging and Troubleshooting

##### Common Issues and Solutions
- **404 API Errors**: Check if frontend proxy route exists for backend endpoint
- **TypeScript Errors**: Ensure types are properly imported and defined
- **Database Connection**: Verify environment variables and database server status
- **React Key Warnings**: Use unique keys for list items (avoid duplicate values)
- **CORS Issues**: Check backend CORS configuration for frontend URL

##### Development Server Issues
```bash
# Backend not starting
cd backend && npm install && npm run dev

# Frontend not starting  
cd frontend && npm install && npm run dev

# Database connection issues
# Check .env files in backend directory
# Verify external PostgreSQL server is accessible
```

##### API Integration Debugging
1. **Backend Logs**: Check backend terminal for API request logs
2. **Frontend Network**: Use browser dev tools to inspect API calls
3. **Proxy Routes**: Verify frontend API routes properly proxy to backend
4. **Authentication**: Ensure user is logged in with valid credentials

## Project Workflows

### Standard Development Workflow
1. **Start Servers**: Run both backend and frontend development servers
2. **Login**: Use test credentials (`testing@only.com` / `test1234`)
3. **Make Changes**: Follow established patterns and conventions
4. **Test Functionality**: Verify changes work in browser
5. **Check Logs**: Monitor both server terminals for errors

### Adding New Features Workflow
1. **Plan Data Model**: Define database schema changes if needed
2. **Backend API**: Create necessary API endpoints
3. **Frontend Services**: Add service layer functions
4. **UI Components**: Create user interface components
5. **Integration**: Connect frontend to backend APIs
6. **Mobile Optimization**: Ensure mobile-first responsive design
7. **Testing**: Verify functionality across different screen sizes

### Bug Fix Workflow
1. **Reproduce Issue**: Understand the problem and its scope
2. **Identify Root Cause**: Use debugging tools and logs
3. **Plan Solution**: Consider impact on existing functionality
4. **Implement Fix**: Make minimal, targeted changes
5. **Verify Resolution**: Test the fix thoroughly
6. **Check Side Effects**: Ensure no new issues are introduced

## Testing & Browser Access
**IMPORTANT**: This web application requires authentication before accessing any pages.

### Test Login Credentials
When using the Simple Browser to test the application, use these credentials:
- **Email**: `testing@only.com`
- **Password**: `test1234`

**Usage**: When opening any page in the Simple Browser (e.g., `http://localhost:3000/coach`), you will be redirected to the login page first. Use the above credentials to authenticate and access the application features.

## Code Style
- Use functional components with hooks (frontend)
- Prefer arrow functions for components and functions
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Use TypeScript interfaces for data structures
- Follow established file and folder naming conventions
- Implement proper error boundaries and loading states

## Performance Considerations
- Optimize images using Next.js Image component
- Implement proper loading states and error handling
- Use dynamic imports for code splitting when appropriate
- Follow Next.js caching and optimization best practices
- Implement efficient database queries with proper indexing

## AI/ML Integration Notes
- Design APIs to support future AI model integration
- Consider real-time data streaming for live coaching
- Plan for machine learning model endpoints
- Design flexible recommendation system architecture

## Technology Stack & Dependencies

### Frontend Technologies
- **Core Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x with custom shark/ocean theme
- **State Management**: React Context API and useState hooks
- **HTTP Client**: Native fetch API with service layer abstraction
- **Authentication**: Next.js middleware with JWT validation
- **Icons**: Custom SVG icons and Phosphor icons
- **Development**: ESLint, TypeScript strict mode

### Backend Technologies
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with strict configuration
- **Database**: PostgreSQL (external server)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting middleware
- **Environment**: dotenv for configuration management
- **Development**: Nodemon for auto-restart, ts-node for TypeScript execution

### Database & External Services
- **Primary Database**: PostgreSQL (school_of_sharks)
- **Database Client**: Native PostgreSQL driver (pg)
- **External API**: intervals.icu for activity data synchronization
- **Schema Management**: SQL migration scripts
- **Connection Pooling**: PostgreSQL connection pooling

### Development Tools
- **Package Management**: npm
- **Code Quality**: ESLint, TypeScript compiler
- **Development Servers**: Next.js dev server, Nodemon
- **Environment Management**: Multiple .env files for different stages
- **Build Tools**: Next.js build system, TypeScript compiler

## File Organization Standards

### Naming Conventions
- **Files**: Use kebab-case for pages (`user-profile.tsx`), PascalCase for components (`UserProfile.tsx`)
- **Directories**: Use lowercase with hyphens (`user-management/`)
- **Variables**: Use camelCase (`userId`, `workoutPlan`)
- **Constants**: Use UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: Use PascalCase (`User`, `WorkoutPlan`)

### Code Organization
- **Single Responsibility**: Each file should have a clear, single purpose
- **Logical Grouping**: Group related functionality in directories
- **Clear Imports**: Use absolute imports from `src/` directory
- **Export Patterns**: Use default exports for main components, named exports for utilities

### Comment Standards
- **JSDoc**: Use JSDoc comments for public functions and complex logic
- **Inline Comments**: Explain non-obvious business logic
- **TODO Comments**: Mark incomplete features or improvements needed
- **API Documentation**: Document API endpoints and data structures

## Performance & Optimization Guidelines

### Frontend Performance
- **Bundle Optimization**: Use dynamic imports for large components
- **Image Optimization**: Always use Next.js Image component
- **CSS Optimization**: Leverage Tailwind's purging for smaller bundles
- **Caching Strategy**: Implement appropriate caching for API responses
- **Code Splitting**: Split code at route level for faster initial loads

### Backend Performance
- **Database Queries**: Use indexes and optimize query patterns
- **Connection Pooling**: Maintain efficient database connections
- **Caching**: Implement Redis caching for frequently accessed data (future)
- **Error Handling**: Proper error handling without sensitive data exposure
- **Rate Limiting**: Protect APIs from abuse

### Mobile Performance
- **Touch Optimization**: 44px minimum touch targets
- **Network Efficiency**: Minimize API calls and optimize payload sizes
- **Loading States**: Provide visual feedback for all async operations
- **Offline Capability**: Plan for offline functionality (future feature)

## Error Handling & Debugging Patterns

### Frontend Error Handling
- **Try-Catch Blocks**: Wrap all async operations in try-catch
- **Error Boundaries**: Implement React error boundaries for component failures
- **User Feedback**: Show user-friendly error messages, not technical details
- **Logging**: Use console.error with 🦈 prefix for easy identification
- **Fallback UI**: Provide fallback components for failed data loads

### Backend Error Handling
- **HTTP Status Codes**: Use appropriate status codes (200, 400, 401, 404, 500)
- **Error Middleware**: Centralized error handling middleware
- **Validation**: Validate all inputs before processing
- **Database Errors**: Handle connection failures and query errors gracefully
- **Security**: Never expose internal error details to clients

### Logging Patterns
```typescript
// Frontend logging
console.log('🦈 Component loaded:', componentName);
console.error('🦈 Error in service:', error);

// Backend logging
console.log('🦈 API request:', method, url);
console.error('🦈 Database error:', error.message);
```

### Common Error Scenarios
1. **Network Failures**: Handle offline scenarios and retry logic
2. **Authentication Errors**: Redirect to login on 401 responses
3. **Validation Errors**: Show field-specific error messages
4. **Database Connection**: Graceful degradation when database is unavailable
5. **External API Failures**: Fallback when intervals.icu is down

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Secure token storage and validation
- **Password Security**: Bcrypt hashing with appropriate salt rounds
- **Session Management**: Proper token expiration and refresh
- **Route Protection**: Middleware for protected routes
- **Role-Based Access**: Different permissions for users vs coaches

### Data Protection
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Escape user-generated content
- **HTTPS Only**: Enforce secure connections in production
- **Environment Variables**: Keep sensitive data in environment files

### API Security
- **CORS Configuration**: Restrict origins to known frontends
- **Rate Limiting**: Prevent API abuse
- **Request Size Limits**: Prevent large payload attacks
- **Headers Security**: Use Helmet middleware for security headers
- **Authentication Required**: Protect all sensitive endpoints

## Future Development Roadmap

### Planned Features
- **Real-time Coaching**: WebSocket integration for live sessions
- **AI Recommendations**: Machine learning for personalized training
- **Mobile App**: React Native version for mobile platforms
- **Video Integration**: Workout video streaming and analysis
- **Social Features**: Community challenges and leaderboards

### Technical Improvements
- **Caching Layer**: Redis for improved performance
- **Microservices**: Split monolith into focused services
- **Container Deployment**: Docker containers for easier deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Application performance monitoring and alerting

### Scalability Considerations
- **Database Optimization**: Query optimization and indexing strategies
- **CDN Integration**: Static asset delivery optimization
- **Load Balancing**: Multiple server instances for high availability
- **Data Archiving**: Long-term data storage strategies
- **API Versioning**: Backward compatibility for API changes
