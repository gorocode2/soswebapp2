# 🦈 School of Sharks - AI Cycling Training Platform

A cutting-edge, high-tech AI cycling training platform that helps cyclists unleash their inner predator with personalized workouts, real-time analytics, and adaptive coaching.

## 🌊 Project Structure

This is a full-stack application with separate frontend and backend:

```
school-of-sharks/
├── frontend/           # Next.js 15 with TypeScript & Tailwind CSS
├── backend/            # Node.js/Express API with PostgreSQL
├── .github/           # GitHub configuration & Copilot instructions
└── public/            # Static assets
```

## ⚡ Features

- 🤖 **AI Coach** - Personal AI trainer with real-time feedback
- 📈 **Performance Analytics** - Advanced metrics and insights
- ⚡ **Dynamic Workouts** - Adaptive training programs
- � **Goal Tracking** - Comprehensive progress monitoring
- 📱 **Responsive Design** - Mobile-first approach
- � **Secure API** - RESTful backend with PostgreSQL

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18 or later
- PostgreSQL database
- npm, yarn, pnpm, or bun

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

The backend API will be available at [http://localhost:5000](http://localhost:5000)

### 3. Database Setup

1. Create a PostgreSQL database called `school_of_sharks`
2. Update the `DATABASE_URL` in `backend/.env`
3. The API will connect automatically when started

## 🛠️ Development Commands

### Frontend
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Turbopack** for fast development
- **ESLint** for code quality

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with pg driver
- **Security middleware** (Helmet, CORS, etc.)
- **Development tools** (nodemon, ts-node)

## 🌐 API Endpoints

### Health Check
- `GET /health` - API health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile/:id` - Get user profile
- `POST /api/users` - Create new user

### Cycling
- `GET /api/cycling/sessions` - Get cycling sessions
- `POST /api/cycling/sessions` - Create cycling session
- `GET /api/cycling/analytics/:userId` - Get user analytics

### Training
- `GET /api/training/programs` - Get AI training programs
- `GET /api/training/recommendations/:userId` - Get AI recommendations
- `POST /api/training/coaching-session` - Start AI coaching session

## 🔧 Configuration

### Environment Variables

Create `backend/.env` based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@localhost:5432/school_of_sharks
JWT_SECRET=your_jwt_secret_key_here
```

## 🏗️ Development Workflow

1. **Frontend Development**: Work in the `frontend/` directory with hot reloading
2. **Backend Development**: Work in the `backend/` directory with nodemon auto-restart
3. **Database Changes**: Update models and migrations in `backend/src/models/`
4. **API Development**: Add new routes in `backend/src/routes/`

## 🎯 Future Enhancements

- User authentication and authorization
- Real-time data streaming for live sessions
- Machine learning model integration
- Mobile app development
- Integration with cycling devices and sensors
- Social features and community challenges

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Ready to dominate your cycling training? Join the School of Sharks! 🦈**

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
