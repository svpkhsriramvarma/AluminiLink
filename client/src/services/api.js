import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Users API
export const usersAPI = {
  searchUsers: async (query, role = 'all') => {
    const response = await api.get(`/users/search?query=${query}&role=${role}`);
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  }
};

// Posts API
export const postsAPI = {
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  getAllPosts: async (page = 1) => {
    const response = await api.get(`/posts?page=${page}`);
    return response.data;
  },

  getFeedPosts: async (page = 1) => {
    const response = await api.get(`/posts/feed?page=${page}`);
    return response.data;
  },

  getUserPosts: async (userId) => {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },

  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId, text) => {
    const response = await api.post(`/posts/${postId}/comment`, { text });
    return response.data;
  },

  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
    return response.data;
  }
};

// Messages API
export const messagesAPI = {
  sendMessage: async (recipient, content) => {
    const response = await api.post('/messages', { recipient, content });
    return response.data;
  },

  getConversation: async (userId) => {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: async (message) => {
    const response = await api.post('/chatbot/chat', { message });
    return response.data;
  }
};

// Interview API
export const interviewAPI = {
  generateInterview: async (topic, difficulty, role) => {
    const response = await api.post('/interviews/generate', { topic, difficulty, role });
    return response.data;
  },

  submitInterview: async (interviewId, answers, timeSpent) => {
    const response = await api.post(`/interviews/${interviewId}/submit`, { answers, timeSpent });
    return response.data;
  },

  getHistory: async (page = 1) => {
    const response = await api.get(`/interviews/history?page=${page}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/interviews/stats');
    return response.data;
  },

  getInterview: async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  }
};

export default api;