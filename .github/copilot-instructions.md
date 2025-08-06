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
