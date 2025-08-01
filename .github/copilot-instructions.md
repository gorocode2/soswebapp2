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
- **Security middleware** (Helmet, CORS, etc.)

## Brand & Theme Guidelines
- **Theme**: High-tech, energetic, shark/predator-inspired
- **Colors**: Ocean blues, cyans, and gradients
- **Tone**: Motivational, competitive, cutting-edge

## Development Guidelines

### Frontend Development
- Use TypeScript for all new files
- Follow Next.js App Router conventions (`frontend/src/app/`)
- Use Tailwind CSS classes for styling with blue/cyan theme
- Implement responsive design patterns
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
