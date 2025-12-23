import axios from 'axios';
import { createDemoAPI } from './demoData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const IS_DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV === 'production';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions - use demo data in production
const demoAPI = createDemoAPI();

export const authAPI = IS_DEMO_MODE ? demoAPI.authAPI : {
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }),
  
  register: (username, email, password) => 
    api.post('/api/auth/register', { username, email, password }),
  
  logout: () => 
    api.post('/api/auth/logout'),
  
  getProfile: () => 
    api.get('/api/auth/profile')
};

export const usersAPI = IS_DEMO_MODE ? demoAPI.usersAPI : {
  getUsers: () => 
    api.get('/api/users'),
  
  searchUsers: (query) => 
    api.get(`/api/users/search?q=${encodeURIComponent(query)}`),
  
  getUserById: (id) => 
    api.get(`/api/users/${id}`)
};

export const messagesAPI = IS_DEMO_MODE ? demoAPI.messagesAPI : {
  getMessages: (userId, page = 1, limit = 50) => 
    api.get(`/api/messages/${userId}?page=${page}&limit=${limit}`),
  
  sendMessage: (receiverId, message, messageType = 'text') => 
    api.post('/api/messages', { receiverId, message, messageType }),
  
  getConversations: () => 
    api.get('/api/messages'),
  
  markAsRead: (userId) => 
    api.put(`/api/messages/${userId}/read`),
  
  editMessage: (messageId, newMessage) => 
    api.put(`/api/messages/${messageId}`, { message: newMessage }),
  
  deleteMessage: (messageId) => 
    api.delete(`/api/messages/${messageId}`)
};

export const groupsAPI = IS_DEMO_MODE ? demoAPI.groupsAPI : {
  getGroups: () => 
    api.get('/api/groups'),
  
  createGroup: (name, description, memberIds) => 
    api.post('/api/groups', { name, description, memberIds }),
  
  getGroupDetails: (groupId) => 
    api.get(`/api/groups/${groupId}`),
  
  addMember: (groupId, userId) => 
    api.post(`/api/groups/${groupId}/members`, { userId }),
  
  removeMember: (groupId, userId) => 
    api.delete(`/api/groups/${groupId}/members/${userId}`),
  
  getGroupMessages: (groupId, page = 1, limit = 50) => 
    api.get(`/api/groups/${groupId}/messages?page=${page}&limit=${limit}`),
  
  sendGroupMessage: (groupId, message, messageType = 'text', replyToMessageId = null) => 
    api.post(`/api/groups/${groupId}/messages`, { message, messageType, replyToMessageId })
};

export const reactionsAPI = {
  addReaction: (messageId, reactionType) => 
    api.post(`/api/reactions/${messageId}`, { reactionType }),
  
  getReactions: (messageId) => 
    api.get(`/api/reactions/${messageId}`),
  
  removeReactions: (messageId) => 
    api.delete(`/api/reactions/${messageId}`)
};

export const settingsAPI = {
  getSettings: () => 
    api.get('/api/settings'),
  
  updateSettings: (settings) => 
    api.put('/api/settings', settings),
  
  blockUser: (userId) => 
    api.post('/api/settings/block', { userId }),
  
  unblockUser: (userId) => 
    api.delete(`/api/settings/block/${userId}`),
  
  getBlockedUsers: () => 
    api.get('/api/settings/blocked'),
  
  starMessage: (messageId) => 
    api.post(`/api/settings/star/${messageId}`),
  
  getStarredMessages: () => 
    api.get('/api/settings/starred')
};

export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/api/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
  },
  
  uploadFiles: (files, onProgress) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return api.post('/api/upload/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
  },
  
  getFileInfo: (filename) => 
    api.get(`/api/upload/info/${filename}`),
  
  deleteFile: (filename) => 
    api.delete(`/api/upload/${filename}`)
};

export default api;