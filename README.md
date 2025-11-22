# AlumniLink - MERN Stack Platform

AlumniLink is a comprehensive platform designed to connect students and alumni for networking, guidance, and knowledge sharing. Built with the MERN stack, it offers real-time messaging, AI-powered assistance, and a rich social experience.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: Secure JWT-based authentication with role-based access (Student/Alumni)
- **Profile Management**: Complete user profiles with skills, bio, profile pictures, and professional information
- **Social Networking**: Follow/unfollow users, view follower counts and connections
- **Posts & Feed**: Create posts with images, like and comment functionality, dual feed modes (Following/Discover)
- **Real-time Messaging**: Direct messaging between users with real-time updates via Socket.io
- **Search & Discovery**: Advanced search by name, role, and filters
- **AI Chatbot**: Google Gemini-powered assistant for student guidance and doubt resolution

### Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Socket.io integration for live messaging
- **File Upload Support**: Profile pictures and post images
- **Security**: Password hashing, JWT tokens, input validation
- **Clean Architecture**: Modular codebase with separation of concerns

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Google Gemini AI** - Chatbot functionality

## 📂 Project Structure

```
/
├── client/                 # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/        # Database and app configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routes
│   │   └── server.js      # Main server file
│   └── package.json
└── README.md
```

## ⚡ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key (for chatbot functionality)

### Installation

1. **Clone and setup the project**:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

2. **Environment Setup**:

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumnilink
JWT_SECRET=your_super_secure_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key_here
```

3. **Start the application**:

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎯 Usage Guide

### Getting Started
1. **Registration**: Sign up as either a Student or Alumni
2. **Profile Setup**: Complete your profile with skills, bio, and professional information
3. **Discovery**: Use the search feature to find and connect with other users
4. **Networking**: Follow interesting people and engage with their content
5. **Messaging**: Connect directly through private messages
6. **AI Assistance**: Use the chatbot for academic doubts and career guidance

### Key Pages
- **Dashboard**: Overview of your activity and quick actions
- **Profile**: Manage your personal and professional information
- **Search**: Discover new connections by name or role
- **Messages**: Real-time chat with your connections
- **AI Assistant**: Get help with studies and career questions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/follow` - Follow/unfollow user

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - Get all posts
- `GET /api/posts/feed` - Get personalized feed
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations

### Chatbot
- `POST /api/chatbot/chat` - Chat with AI assistant

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Rate Limiting**: Protection against abuse (can be added)

## 🎨 Design Features

- **Modern UI**: Clean, professional interface design
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Subtle transitions and hover effects
- **Intuitive Navigation**: Easy-to-use sidebar and mobile menu
- **Loading States**: Visual feedback for all user actions
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Ensure MongoDB connection string is configured
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting service
3. Update API endpoints to point to your deployed backend

