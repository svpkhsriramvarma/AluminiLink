# AlumniLink - Complete API Reference

## Table of Contents
1. [Base Information](#base-information)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Post Management](#post-management)
5. [Messaging](#messaging)
6. [AI Services](#ai-services)
7. [File Uploads](#file-uploads)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

## Base Information

### Base URL
```
http://localhost:5000/api
```

### Content Type
```
Content-Type: application/json
```

### Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Authentication

### POST /api/auth/register
**Description**: Register a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "Student"
}
```

**Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "Student",
    "profilePicture": "",
    "createdAt": "2025-01-20T10:30:00.000Z"
  }
}
```

**Validation Rules**:
- `name`: Required, max 100 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 6 characters
- `role`: Required, must be "Student" or "Alumni"

---

### POST /api/auth/login
**Description**: Authenticate existing user

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "Student",
    "profilePicture": "",
    "lastLogin": "2025-01-20T10:30:00.000Z"
  }
}
```

---

### GET /api/auth/me
**Description**: Get current authenticated user profile

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "Student",
  "profilePicture": "",
  "skills": ["JavaScript", "React", "Node.js"],
  "bio": "Passionate developer learning new technologies",
  "followers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "profilePicture": "",
      "role": "Alumni"
    }
  ],
  "following": [],
  "graduationYear": 2026,
  "currentPosition": "",
  "company": "",
  "isActive": true,
  "lastLogin": "2025-01-20T10:30:00.000Z",
  "createdAt": "2025-01-15T08:00:00.000Z",
  "updatedAt": "2025-01-20T10:30:00.000Z"
}
```

---

### POST /api/auth/refresh
**Description**: Refresh JWT token

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:
```json
{
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /api/auth/logout
**Description**: Logout user (client-side token removal)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:
```json
{
  "message": "Logout successful"
}
```

---

### POST /api/auth/change-password
**Description**: Change user password

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response (200 OK)**:
```json
{
  "message": "Password changed successfully"
}
```

## User Management

### GET /api/users/search
**Description**: Search users by name and role

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `query` (required): Search term (min 1 character)
- `role` (optional): Filter by role ("Student", "Alumni", "all")

**Example Request**:
```
GET /api/users/search?query=john&role=Student
```

**Response (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "profilePicture": "",
    "role": "Student",
    "skills": ["JavaScript", "React"],
    "bio": "Passionate developer",
    "followerCount": 5,
    "followingCount": 3
  }
]
```

---

### GET /api/users/:id
**Description**: Get user profile by ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: User ID (MongoDB ObjectId)

**Response (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "Student",
  "profilePicture": "",
  "skills": ["JavaScript", "React", "Node.js"],
  "bio": "Passionate developer learning new technologies",
  "followers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "profilePicture": "",
      "role": "Alumni"
    }
  ],
  "following": [],
  "graduationYear": 2026,
  "currentPosition": "",
  "company": "",
  "isActive": true,
  "createdAt": "2025-01-15T08:00:00.000Z",
  "updatedAt": "2025-01-20T10:30:00.000Z"
}
```

---

### PUT /api/users/profile
**Description**: Update current user profile

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (all fields optional):
```json
{
  "name": "John Smith",
  "bio": "Updated bio information",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "graduationYear": 2026,
  "currentPosition": "Software Developer Intern",
  "company": "Tech Corp",
  "profilePicture": "https://example.com/image.jpg"
}
```

**Response (200 OK)**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "bio": "Updated bio information",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "graduationYear": 2026,
    "currentPosition": "Software Developer Intern",
    "company": "Tech Corp",
    "profilePicture": "https://example.com/image.jpg",
    "updatedAt": "2025-01-20T11:00:00.000Z"
  }
}
```

---

### POST /api/users/:id/follow
**Description**: Follow or unfollow a user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: User ID to follow/unfollow

**Response (200 OK)**:
```json
{
  "message": "User followed successfully",
  "isFollowing": true,
  "followerCount": 6
}
```

---

### GET /api/users/:id/followers
**Description**: Get user's followers list

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: User ID

**Response (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "profilePicture": "",
    "role": "Alumni"
  }
]
```

---

### GET /api/users/:id/following
**Description**: Get users that the specified user is following

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: User ID

**Response (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Bob Johnson",
    "profilePicture": "",
    "role": "Alumni"
  }
]
```

## Post Management

### POST /api/posts
**Description**: Create a new post

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "description": "Just finished building my first React app! #coding #react #webdev",
  "image": "https://example.com/post-image.jpg"
}
```

**Response (201 Created)**:
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "507f1f77bcf86cd799439020",
    "author": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "profilePicture": "",
      "role": "Student"
    },
    "description": "Just finished building my first React app! #coding #react #webdev",
    "image": "https://example.com/post-image.jpg",
    "likes": [],
    "comments": [],
    "tags": ["coding", "react", "webdev"],
    "likeCount": 0,
    "commentCount": 0,
    "isActive": true,
    "createdAt": "2025-01-20T11:00:00.000Z",
    "updatedAt": "2025-01-20T11:00:00.000Z"
  }
}
```

**Validation Rules**:
- `description`: Required, max 1000 characters
- `image`: Optional, valid URL

---

### GET /api/posts
**Description**: Get all posts (public feed)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10, max: 50)

**Example Request**:
```
GET /api/posts?page=1&limit=5
```

**Response (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "author": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "profilePicture": "",
      "role": "Student"
    },
    "description": "Just finished building my first React app! #coding #react #webdev",
    "image": "https://example.com/post-image.jpg",
    "likes": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "profilePicture": ""
      }
    ],
    "comments": [
      {
        "_id": "507f1f77bcf86cd799439030",
        "author": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jane Smith",
          "profilePicture": ""
        },
        "text": "Great job! Keep it up!",
        "createdAt": "2025-01-20T11:05:00.000Z"
      }
    ],
    "tags": ["coding", "react", "webdev"],
    "likeCount": 1,
    "commentCount": 1,
    "isActive": true,
    "createdAt": "2025-01-20T11:00:00.000Z",
    "updatedAt": "2025-01-20T11:00:00.000Z"
  }
]
```

---

### GET /api/posts/feed
**Description**: Get personalized feed (posts from followed users + own posts)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10, max: 50)

**Response (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "author": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "profilePicture": "",
      "role": "Student"
    },
    "description": "Just finished building my first React app!",
    "image": "",
    "likes": [],
    "comments": [],
    "tags": ["coding", "react", "webdev"],
    "likeCount": 0,
    "commentCount": 0,
    "isActive": true,
    "createdAt": "2025-01-20T11:00:00.000Z",
    "updatedAt": "2025-01-20T11:00:00.000Z"
  }
]
```

---

### POST /api/posts/:id/like
**Description**: Like or unlike a post

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: Post ID

**Response (200 OK)**:
```json
{
  "message": "Post liked successfully",
  "isLiked": true,
  "likeCount": 1
}
```

---

### POST /api/posts/:id/comment
**Description**: Add comment to a post

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: Post ID

**Request Body**:
```json
{
  "text": "Great post! Keep sharing your journey."
}
```

**Response (200 OK)**:
```json
{
  "message": "Comment added successfully",
  "comment": {
    "_id": "507f1f77bcf86cd799439030",
    "author": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "profilePicture": ""
    },
    "text": "Great post! Keep sharing your journey.",
    "createdAt": "2025-01-20T11:10:00.000Z"
  }
}
```

**Validation Rules**:
- `text`: Required, max 300 characters

---

### DELETE /api/posts/:id/comment/:commentId
**Description**: Delete a comment from a post

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: Post ID
- `commentId`: Comment ID

**Response (200 OK)**:
```json
{
  "message": "Comment deleted successfully"
}
```

---

### GET /api/posts/user/:userId
**Description**: Get posts by specific user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `userId`: User ID

**Response (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "author": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "profilePicture": "",
      "role": "Student"
    },
    "description": "Just finished building my first React app!",
    "image": "",
    "likes": [],
    "comments": [],
    "tags": ["coding", "react", "webdev"],
    "likeCount": 0,
    "commentCount": 0,
    "isActive": true,
    "createdAt": "2025-01-20T11:00:00.000Z",
    "updatedAt": "2025-01-20T11:00:00.000Z"
  }
]
```

## Messaging

### POST /api/messages
**Description**: Send a message to another user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "recipient": "507f1f77bcf86cd799439012",
  "content": "Hi! I'd love to connect and learn from your experience.",
  "messageType": "text",
  "attachmentUrl": ""
}
```

**Response (201 Created)**:
```json
{
  "message": "Message sent successfully",
  "messageData": {
    "_id": "507f1f77bcf86cd799439040",
    "sender": "507f1f77bcf86cd799439011",
    "recipient": "507f1f77bcf86cd799439012",
    "content": "Hi! I'd love to connect and learn from your experience.",
    "messageType": "text",
    "attachmentUrl": "",
    "read": false,
    "isActive": true,
    "createdAt": "2025-01-20T11:15:00.000Z",
    "updatedAt": "2025-01-20T11:15:00.000Z"
  }
}
```

**Validation Rules**:
- `recipient`: Required, valid MongoDB ObjectId
- `content`: Required if no attachment, max 1000 characters
- `messageType`: Optional, "text", "image", or "file"
- `attachmentUrl`: Optional, valid URL

---

### GET /api/messages/conversations
**Description**: Get all user conversations

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:
```json
[
  {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "profilePicture": "",
      "role": "Alumni"
    },
    "lastMessage": {
      "_id": "507f1f77bcf86cd799439040",
      "sender": "507f1f77bcf86cd799439011",
      "recipient": "507f1f77bcf86cd799439012",
      "content": "Hi! I'd love to connect and learn from your experience.",
      "messageType": "text",
      "read": false,
      "createdAt": "2025-01-20T11:15:00.000Z"
    },
    "unreadCount": 1
  }
]
```

---

### GET /api/messages/conversation/:userId
**Description**: Get conversation with specific user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `userId`: User ID to get conversation with

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50, max: 100)

**Response (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439040",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "profilePicture": "",
      "role": "Student"
    },
    "recipient": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "profilePicture": "",
      "role": "Alumni"
    },
    "content": "Hi! I'd love to connect and learn from your experience.",
    "messageType": "text",
    "attachmentUrl": "",
    "read": false,
    "isActive": true,
    "createdAt": "2025-01-20T11:15:00.000Z",
    "updatedAt": "2025-01-20T11:15:00.000Z"
  }
]
```

---

### POST /api/messages/upload
**Description**: Upload file for messaging

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data**:
- `file`: File to upload (images or PDFs, max 10MB)

**Response (200 OK)**:
```json
{
  "url": "/uploads/file-1755768983073-811421542.jpg",
  "message": "File uploaded successfully"
}
```

**Supported File Types**:
- Images: JPG, JPEG, PNG, GIF, WebP
- Documents: PDF
- Maximum size: 10MB

## AI Services

### POST /api/chatbot/chat
**Description**: Chat with AI assistant

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "message": "How can I prepare for a software engineering interview?"
}
```

**Response (200 OK)**:
```json
{
  "message": "Great question! Here are some key areas to focus on for software engineering interviews:\n\n1. **Data Structures & Algorithms**: Practice common problems on platforms like LeetCode or HackerRank\n2. **System Design**: Understand basic concepts like scalability, databases, and APIs\n3. **Coding**: Practice writing clean, efficient code in your preferred language\n4. **Behavioral**: Prepare stories about your projects, challenges, and teamwork\n5. **Company Research**: Understand the company's products, culture, and recent news\n\nI'd recommend starting with data structures and algorithms, as they're fundamental to most technical interviews. Would you like me to suggest some specific practice problems?",
  "timestamp": "2025-01-20T11:20:00.000Z",
  "success": true
}
```

**Validation Rules**:
- `message`: Required, max 1000 characters

---

### GET /api/chatbot/suggestions
**Description**: Get suggested questions for chatbot

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:
```json
{
  "suggestions": [
    "How do I prepare for technical interviews?",
    "What career paths are available in my field?",
    "How to build a professional network?",
    "Tips for balancing coursework and projects",
    "How to get research opportunities?",
    "What skills are employers looking for?"
  ],
  "userRole": "Student"
}
```

---

### GET /api/chatbot/health
**Description**: Check chatbot service health

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:
```json
{
  "status": "OK",
  "geminiConfigured": true,
  "geminiWorking": true,
  "timestamp": "2025-01-20T11:20:00.000Z"
}
```

## Interview System

### POST /api/interviews/generate
**Description**: Generate AI interview questions

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "topic": "JavaScript Fundamentals",
  "difficulty": "Medium",
  "role": "Frontend Developer"
}
```

**Response (200 OK)**:
```json
{
  "message": "Interview questions generated successfully",
  "interview": {
    "_id": "507f1f77bcf86cd799439050",
    "topic": "JavaScript Fundamentals",
    "difficulty": "Medium",
    "role": "Frontend Developer",
    "questions": [
      {
        "question": "What is the difference between var, let, and const in JavaScript?",
        "options": [
          "They are all the same",
          "var is function-scoped, let and const are block-scoped",
          "let and const are function-scoped, var is block-scoped",
          "They all have different scoping rules"
        ]
      }
    ],
    "status": "in-progress",
    "createdAt": "2025-01-20T11:25:00.000Z"
  }
}
```

**Validation Rules**:
- `topic`: Required, string
- `difficulty`: Required, must be "Easy", "Medium", or "Hard"
- `role`: Required, string

---

### POST /api/interviews/:id/submit
**Description**: Submit interview answers

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: Interview ID

**Request Body**:
```json
{
  "answers": [1, 0, 2, 1, 3],
  "timeSpent": 300
}
```

**Response (200 OK)**:
```json
{
  "message": "Interview submitted successfully",
  "results": {
    "score": 3,
    "percentage": 60,
    "totalQuestions": 5,
    "correctAnswers": 3,
    "timeSpent": 300,
    "questions": [
      {
        "question": "What is the difference between var, let, and const in JavaScript?",
        "options": [
          "They are all the same",
          "var is function-scoped, let and const are block-scoped",
          "let and const are function-scoped, var is block-scoped",
          "They all have different scoping rules"
        ],
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "explanation": "var is function-scoped while let and const are block-scoped."
      }
    ]
  }
}
```

**Validation Rules**:
- `answers`: Required, array of 5 numbers (0-3)
- `timeSpent`: Optional, number (seconds)

---

### GET /api/interviews/history
**Description**: Get user's interview history

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Interviews per page (default: 10)

**Response (200 OK)**:
```json
{
  "interviews": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "topic": "JavaScript Fundamentals",
      "difficulty": "Medium",
      "role": "Frontend Developer",
      "score": 3,
      "percentage": 60,
      "completedAt": "2025-01-20T11:30:00.000Z",
      "timeSpent": 300
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 1
  }
}
```

---

### GET /api/interviews/stats
**Description**: Get user's interview statistics

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:
```json
{
  "totalInterviews": 5,
  "highestScore": 5,
  "lowestScore": 2,
  "averageScore": 3.4,
  "highestPercentage": 100,
  "lowestPercentage": 40,
  "averagePercentage": 68
}
```

---

### GET /api/interviews/:id
**Description**: Get specific interview details

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: Interview ID

**Response (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439050",
  "user": "507f1f77bcf86cd799439011",
  "topic": "JavaScript Fundamentals",
  "difficulty": "Medium",
  "role": "Frontend Developer",
  "questions": [
    {
      "question": "What is the difference between var, let, and const in JavaScript?",
      "options": [
        "They are all the same",
        "var is function-scoped, let and const are block-scoped",
        "let and const are function-scoped, var is block-scoped",
        "They all have different scoping rules"
      ],
      "correctAnswer": 1,
      "explanation": "var is function-scoped while let and const are block-scoped."
    }
  ],
  "userAnswers": [1, 0, 2, 1, 3],
  "score": 3,
  "percentage": 60,
  "completedAt": "2025-01-20T11:30:00.000Z",
  "timeSpent": 300,
  "status": "completed",
  "createdAt": "2025-01-20T11:25:00.000Z",
  "updatedAt": "2025-01-20T11:30:00.000Z"
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    "Name cannot be empty",
    "Email must be a valid email address"
  ]
}
```

#### 401 Unauthorized
```json
{
  "message": "Access denied. No token provided.",
  "code": "NO_TOKEN"
}
```

#### 403 Forbidden
```json
{
  "message": "Access denied. Required role(s): Student, Alumni",
  "code": "INSUFFICIENT_ROLE"
}
```

#### 404 Not Found
```json
{
  "message": "User not found"
}
```

#### 429 Too Many Requests
```json
{
  "message": "Too many authentication attempts. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

#### 500 Internal Server Error
```json
{
  "message": "Server error while processing your request. Please try again later.",
  "error": "Internal server error"
}
```

### Error Codes Reference

| Code | Description |
|------|-------------|
| `NO_TOKEN` | No authentication token provided |
| `INVALID_TOKEN_FORMAT` | Token format is incorrect |
| `TOKEN_EXPIRED` | JWT token has expired |
| `INVALID_TOKEN` | Token is invalid or corrupted |
| `USER_NOT_FOUND` | User not found in database |
| `ACCOUNT_DEACTIVATED` | User account is deactivated |
| `AUTH_REQUIRED` | Authentication is required for this endpoint |
| `INSUFFICIENT_ROLE` | User doesn't have required role |
| `RATE_LIMIT_EXCEEDED` | Too many requests, rate limit exceeded |

## Rate Limiting

### Authentication Endpoints
- **Rate Limit**: 5 attempts per 15 minutes
- **Affected Endpoints**: `/api/auth/login`, `/api/auth/register`
- **Response**: 429 Too Many Requests with retry information

### General Endpoints
- **Rate Limit**: No specific limit (handled by server capacity)
- **Recommendation**: Implement reasonable request frequency

### File Uploads
- **File Size Limit**: 10MB per file
- **Supported Types**: Images (JPG, PNG, GIF, WebP) and PDFs
- **Rate Limit**: No specific limit

---

**API Version**: 1.0  
**Last Updated**: January 2025  
**Project**: AlumniLink - MERN Stack Platform  
**Base URL**: http://localhost:5000/api

