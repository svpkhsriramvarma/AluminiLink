# AlumniLink - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [Authentication System](#authentication-system)
7. [Feature Analysis](#feature-analysis)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [Security Features](#security-features)
10. [Deployment & Configuration](#deployment--configuration)

## Project Overview

**AlumniLink** is a comprehensive networking platform designed to connect students and alumni for professional development, knowledge sharing, and career guidance. The platform serves as a bridge between current students and successful alumni, facilitating mentorship, networking, and collaborative learning.

### Project Purpose
- **Student-Alumni Networking**: Enable students to connect with alumni for career guidance
- **Knowledge Sharing**: Facilitate sharing of experiences, skills, and industry insights
- **Career Development**: Provide AI-powered interview preparation and career counseling
- **Community Building**: Create a vibrant community of learners and professionals

### Target Users
- **Students**: Current students seeking career guidance and networking opportunities
- **Alumni**: Graduates who want to mentor students and stay connected
- **Faculty**: Educators who can facilitate industry-academia collaboration

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │   (Express.js)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.io     │    │   Google Gemini │    │   File Storage  │
│   (Real-time)   │    │   (AI Services) │    │   (Uploads)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
```
Frontend (React.js)
├── Components/
│   ├── Layout.js          # Main layout wrapper
│   ├── Navbar.js          # Navigation header
│   ├── Sidebar.js         # Left sidebar navigation
│   ├── PostCard.js        # Individual post display
│   └── CreatePost.js      # Post creation form
├── Pages/
│   ├── Dashboard.js       # Main dashboard
│   ├── Profile.js         # User profile management
│   ├── Search.js          # User search functionality
│   ├── Messages.js        # Real-time messaging
│   ├── Chatbot.js         # AI assistant interface
│   └── Interview.js       # AI interview system
├── Context/
│   └── AuthContext.js     # Authentication state management
└── Services/
    └── api.js             # API communication layer

Backend (Node.js + Express)
├── Models/
│   ├── User.js            # User data model
│   ├── Post.js            # Post data model
│   ├── Message.js         # Message data model
│   └── Interview.js       # Interview data model
├── Routes/
│   ├── auth.js            # Authentication endpoints
│   ├── users.js           # User management endpoints
│   ├── posts.js           # Post management endpoints
│   ├── messages.js        # Messaging endpoints
│   ├── chatbot.js         # AI chatbot endpoints
│   └── interviews.js      # Interview system endpoints
├── Middleware/
│   └── auth.js            # JWT authentication middleware
└── Config/
    └── database.js        # Database connection configuration
```

## Technology Stack

### Frontend Technologies
- **React.js 18.2.0**: Modern UI library with hooks and functional components
- **React Router 6.15.0**: Client-side routing and navigation
- **Tailwind CSS 3.3.3**: Utility-first CSS framework for responsive design
- **Axios 1.5.0**: HTTP client for API communication
- **Socket.io Client 4.8.1**: Real-time communication
- **Lucide React 0.344.0**: Modern icon library

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js 4.18.2**: Web application framework
- **MongoDB**: NoSQL document database
- **Mongoose 7.5.0**: MongoDB object modeling tool
- **Socket.io 4.8.1**: Real-time bidirectional communication
- **JWT 9.0.2**: JSON Web Token authentication
- **bcryptjs 2.4.3**: Password hashing and salting
- **Multer 1.4.5**: File upload handling
- **Google Gemini AI**: AI-powered chatbot and interview generation

### Development Tools
- **Nodemon**: Development server with auto-restart
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing

## Database Design

### Entity Relationship Diagram (ERD)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      User       │    │      Post       │    │     Message     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ _id: ObjectId   │    │ _id: ObjectId   │    │ _id: ObjectId   │
│ name: String    │    │ author: ObjectId│    │ sender: ObjectId│
│ email: String   │    │ description: Str│    │ recipient: ObjId│
│ password: String│    │ image: String   │    │ content: String │
│ role: String    │    │ likes: [ObjectId]│   │ read: Boolean   │
│ profilePicture: │    │ comments: [Obj] │    │ messageType: Str│
│ skills: [String]│    │ tags: [String]  │    │ attachmentUrl:  │
│ bio: String     │    │ isActive: Bool  │    │ isActive: Bool  │
│ followers: [Obj]│    │ createdAt: Date │    │ createdAt: Date │
│ following: [Obj]│    │ updatedAt: Date │    │ updatedAt: Date │
│ graduationYear: │    └─────────────────┘    └─────────────────┘
│ currentPosition:│              │                       │
│ company: String │              │                       │
│ isActive: Bool  │              │                       │
│ lastLogin: Date │              │                       │
│ createdAt: Date │              │                       │
│ updatedAt: Date │              │                       │
└─────────────────┘              │                       │
         │                       │                       │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Comment       │              │
         │              ├─────────────────┤              │
         │              │ author: ObjectId│              │
         │              │ text: String    │              │
         │              │ createdAt: Date │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                       ┌─────────────────┐
                       │    Interview    │
                       ├─────────────────┤
                       │ _id: ObjectId   │
                       │ user: ObjectId  │
                       │ topic: String   │
                       │ difficulty: Str │
                       │ role: String    │
                       │ questions: [Obj]│
                       │ userAnswers: [] │
                       │ score: Number   │
                       │ percentage: Num │
                       │ completedAt: Date│
                       │ timeSpent: Num  │
                       │ status: String  │
                       │ createdAt: Date │
                       │ updatedAt: Date │
                       └─────────────────┘
```

### Database Schema Details

#### User Collection
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: email, name, role, createdAt
- **Virtual Fields**: followerCount, followingCount
- **Pre-save Hooks**: Password hashing, validation
- **Methods**: comparePassword, getPublicProfile

#### Post Collection
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: author, createdAt, likes, isActive
- **Embedded Documents**: comments (subdocument array)
- **Virtual Fields**: likeCount, commentCount
- **Methods**: isLikedBy, addLike, removeLike, addComment

#### Message Collection
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: sender+recipient, recipient+read, createdAt
- **Virtual Fields**: conversationId
- **Methods**: markAsRead, getConversation, getUserConversations

#### Interview Collection
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: user, user+score
- **Embedded Documents**: questions (subdocument array)
- **Methods**: calculateScore, getUserStats

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: User registration
**Input Fields**:
- `name` (String, required): User's full name
- `email` (String, required): User's email address
- `password` (String, required): User's password (min 6 chars)
- `role` (String, required): Either "Student" or "Alumni"

**Output Fields**:
- `message` (String): Success message
- `token` (String): JWT authentication token
- `user` (Object): User data without password

**Data Flow**: Client → Server → Database → JWT Generation → Response

#### POST /api/auth/login
**Purpose**: User authentication
**Input Fields**:
- `email` (String, required): User's email
- `password` (String, required): User's password

**Output Fields**:
- `message` (String): Success message
- `token` (String): JWT authentication token
- `user` (Object): User profile data

**Data Flow**: Client → Server → Database (password verification) → JWT Generation → Response

#### GET /api/auth/me
**Purpose**: Get current user profile
**Authentication**: Required (JWT token)
**Output Fields**: Complete user profile with populated followers/following

### User Management Endpoints

#### GET /api/users/search
**Purpose**: Search users by name and role
**Input Fields**:
- `query` (String, required): Search term (min 1 char)
- `role` (String, optional): Filter by role ("Student", "Alumni", "all")

**Output Fields**: Array of matching users with basic profile information

#### PUT /api/users/profile
**Purpose**: Update user profile
**Input Fields**:
- `name` (String, optional): Updated name
- `bio` (String, optional): Updated bio (max 500 chars)
- `skills` (Array, optional): Updated skills list
- `graduationYear` (Number, optional): Graduation year
- `currentPosition` (String, optional): Job title
- `company` (String, optional): Company name
- `profilePicture` (String, optional): Profile picture URL

### Post Management Endpoints

#### POST /api/posts
**Purpose**: Create new post
**Input Fields**:
- `description` (String, required): Post content (max 1000 chars)
- `image` (String, optional): Image URL

**Output Fields**: Created post with populated author information

#### GET /api/posts/feed
**Purpose**: Get personalized feed (following users + own posts)
**Output Fields**: Paginated posts from followed users

#### POST /api/posts/:id/like
**Purpose**: Like/unlike a post
**Output Fields**: Updated post with like status

### Messaging Endpoints

#### POST /api/messages
**Purpose**: Send message
**Input Fields**:
- `recipient` (String, required): Recipient user ID
- `content` (String, optional): Message text (max 1000 chars)
- `messageType` (String, optional): "text", "image", or "file"
- `attachmentUrl` (String, optional): File attachment URL

#### GET /api/messages/conversations
**Purpose**: Get all user conversations
**Output Fields**: List of conversations with last message and unread count

### AI Services Endpoints

#### POST /api/chatbot/chat
**Purpose**: Chat with AI assistant
**Input Fields**:
- `message` (String, required): User's question (max 1000 chars)

**Output Fields**:
- `message` (String): AI response
- `timestamp` (Date): Response timestamp
- `success` (Boolean): Operation status

#### POST /api/interviews/generate
**Purpose**: Generate AI interview questions
**Input Fields**:
- `topic` (String, required): Interview topic
- `difficulty` (String, required): "Easy", "Medium", or "Hard"
- `role` (String, required): Target role

**Output Fields**: Interview object with 5 multiple-choice questions

## Authentication System

### JWT Token Structure
```json
{
  "id": "user_object_id",
  "iat": "issued_at_timestamp",
  "exp": "expiration_timestamp"
}
```

### Authentication Flow
```
1. User Login/Register
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT token
   ↓
4. Client stores token in localStorage
   ↓
5. Client includes token in Authorization header
   ↓
6. Server validates token on protected routes
   ↓
7. Server adds user info to req.user
```

### Security Features
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Token Expiration**: 7-day JWT tokens
- **Rate Limiting**: 5 attempts per 15 minutes for auth routes
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests

## Feature Analysis

### 1. User Authentication & Profile Management
**Input Fields**:
- Registration: name, email, password, role
- Profile Update: bio, skills, graduationYear, currentPosition, company, profilePicture

**Output Fields**:
- User profile with followers/following counts
- JWT authentication token
- Profile update confirmation

**Data Flow**: Client form → API validation → Database update → Response confirmation

### 2. Social Networking
**Input Fields**:
- Follow/Unfollow: target user ID
- Search: query string, role filter

**Output Fields**:
- Updated follower/following lists
- Search results with user profiles
- Connection status

**Data Flow**: Client action → Server validation → Database update → Real-time notification

### 3. Content Management (Posts)
**Input Fields**:
- Post creation: description, image URL
- Interaction: like, comment text

**Output Fields**:
- Created/updated posts
- Like counts and comment lists
- Feed with pagination

**Data Flow**: Client input → Server processing → Database storage → Feed update

### 4. Real-time Messaging
**Input Fields**:
- Message: recipient ID, content, attachment
- File upload: multipart form data

**Output Fields**:
- Message confirmation
- Real-time delivery via Socket.io
- File URLs for attachments

**Data Flow**: Client message → Server storage → Socket.io broadcast → Recipient notification

### 5. AI Chatbot Assistant
**Input Fields**:
- User question (text)

**Output Fields**:
- AI-generated response
- Response timestamp
- Success status

**Data Flow**: Client question → Google Gemini API → Response processing → Client display

### 6. AI Interview System
**Input Fields**:
- Interview generation: topic, difficulty, role
- Interview submission: answers array, time spent

**Output Fields**:
- Generated questions with options
- Score and percentage
- Detailed results with explanations

**Data Flow**: Client request → Gemini AI → Question generation → Database storage → Client display

## Data Flow Diagrams

### 1. User Registration Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │    │   Response  │
│             │    │             │    │             │    │             │
│ 1. Form     │───►│ 2. Validate │───►│ 3. Store    │───►│ 4. JWT      │
│   Submit    │    │   Input     │    │   User      │    │   Token     │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Post Creation Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │    │   Response  │
│             │    │             │    │             │    │             │
│ 1. Post     │───►│ 2. Auth    │───►│ 3. Store    │───►│ 4. Return   │
│   Content   │    │   Check     │    │   Post      │    │   Post      │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 3. Real-time Messaging Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Sender     │    │   Server    │    │  Database   │    │  Recipient  │
│             │    │             │    │             │    │             │
│ 1. Send     │───►│ 2. Store    │───►│ 3. Save     │───►│ 4. Socket   │
│   Message   │    │   Message   │    │   Message   │    │   Event     │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 4. AI Interview Generation Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │ Gemini AI   │    │  Database   │
│             │    │             │    │             │    │             │
│ 1. Request  │───►│ 2. Format  │───►│ 3. Generate │───►│ 4. Store    │
│   Interview │    │   Prompt    │    │ Questions   │    │ Interview   │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Security Features

### Authentication Security
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Token Expiration**: Automatic token refresh
- **Rate Limiting**: Protection against brute force attacks

### Data Security
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Mongoose ODM prevents injection
- **File Upload Security**: File type and size validation
- **CORS Configuration**: Secure cross-origin requests

### API Security
- **Protected Routes**: Authentication middleware for sensitive endpoints
- **Role-based Access**: Role verification for specific features
- **Error Handling**: Generic error messages in production
- **Request Validation**: Comprehensive input sanitization

## Deployment & Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumnilink
JWT_SECRET=your_super_secure_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create database: `alumnilink`
3. Configure connection string in environment variables

### Backend Deployment
1. Install Node.js dependencies: `npm install`
2. Set environment variables
3. Start server: `npm run dev` (development) or `npm start` (production)

### Frontend Deployment
1. Install React dependencies: `npm install`
2. Build for production: `npm run build`
3. Serve static files or deploy to hosting service

### Production Considerations
- **HTTPS**: Enable SSL/TLS encryption
- **Environment Variables**: Secure production secrets
- **Database**: Use production MongoDB instance
- **Monitoring**: Implement logging and error tracking
- **Backup**: Regular database backups
- **Scaling**: Load balancing for high traffic

## Project Benefits & Impact

### For Students
- **Career Guidance**: Direct access to alumni mentors
- **Skill Development**: Learn from industry professionals
- **Interview Preparation**: AI-powered practice interviews
- **Networking**: Build professional connections early

### For Alumni
- **Mentorship Opportunities**: Give back to the community
- **Professional Growth**: Expand professional network
- **Industry Insights**: Stay updated with current trends
- **Recruitment**: Identify potential candidates

### For Educational Institutions
- **Alumni Engagement**: Maintain strong alumni relationships
- **Student Success**: Improve career outcomes
- **Industry Connections**: Bridge academia and industry
- **Data Insights**: Track student-alumni interactions

## Future Enhancements

### Technical Improvements
- **Microservices Architecture**: Break down monolithic backend
- **Real-time Notifications**: Push notifications for mobile
- **Advanced Analytics**: User behavior and engagement metrics
- **API Versioning**: Support for multiple API versions

### Feature Additions
- **Video Calls**: Integrated video conferencing
- **Job Board**: Alumni job postings and applications
- **Learning Paths**: Structured skill development programs
- **Mobile App**: Native mobile applications

### AI Enhancements
- **Personalized Recommendations**: AI-powered content suggestions
- **Smart Matching**: Intelligent mentor-mentee pairing
- **Content Moderation**: AI-powered content filtering
- **Predictive Analytics**: Career path predictions

---

**Documentation Version**: 1.0  
**Last Updated**: January 2025  
**Project**: AlumniLink - MERN Stack Platform  
**Team**: AlumniLink Development Team

