import axios from 'axios';

// 1. Create a centralized Axios instance
const api = axios.create({
  // This points to your Node.js/Express Backend
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add a "Request Interceptor" (The Security Guard)
// This function runs AUTOMATICALLY before every request.
api.interceptors.request.use(
  (config) => {
    // Check if the user has a token in localStorage
    const token = localStorage.getItem('token'); // We will save this during Login
    
    // If token exists, attach it to the header: "Authorization: Bearer <token>"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;