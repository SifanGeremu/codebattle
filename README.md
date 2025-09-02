# CodeBattle - Full-Stack Coding Challenge Platform

A modern, real-time coding challenge platform built with React, Node.js, and WebSockets. Features include user authentication, coding challenges, real-time duels, and a dynamic leaderboard.

## 🚀 Features

- **User Authentication**: Email and GitHub OAuth integration
- **Coding Challenges**: Interactive challenges with Monaco Editor
- **Real-time Duels**: Live coding battles with WebSocket support
- **Dynamic Leaderboard**: Rankings based on performance and ratings
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels
- **Real-time Updates**: Live notifications and status updates

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Monaco Editor for code editing
- Socket.IO client for real-time features
- Vitest for testing

**Backend:**
- Node.js with Express
- SQLite database (better-sqlite3)
- Socket.IO for real-time communication
- JWT for authentication
- Bcrypt for password hashing
- Comprehensive error handling

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the frontend (port 5173) and backend (port 3001) concurrently.

## 🧪 Testing

Run frontend tests:
```bash
npm run test
```

Run backend tests:
```bash
npm run test:server
```

## 🎮 Usage

1. **Sign Up/Login**: Create an account or sign in with GitHub
2. **Browse Challenges**: Explore coding challenges by difficulty and category
3. **Solve Problems**: Use the Monaco editor to write and test your solutions
4. **Start Duels**: Challenge other users to real-time coding battles
5. **Track Progress**: View your ranking on the leaderboard

## 🏗️ Architecture

The application follows a modular architecture with clear separation of concerns:

- **Frontend**: Component-based React architecture with context for state management
- **Backend**: RESTful API with Express.js and real-time WebSocket communication
- **Database**: Normalized SQLite schema with proper relationships
- **Real-time**: Socket.IO for live duels and notifications

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention with prepared statements
- CORS and helmet middleware for security headers
- Input validation and sanitization

## 🚀 Deployment

The application includes GitHub Actions CI/CD pipeline for automated testing and deployment./removed for now

## 📱 Responsive Design

Optimized breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast theme support
- Focus management

## 🎨 Design System

- 8px spacing grid system
- Comprehensive color palette with semantic meanings
- Typography hierarchy with proper line spacing
- Consistent hover states and micro-interactions
- Apple-level design aesthetics

## 📄 License

MIT License - feel free to use this project for learning and development purposes.
