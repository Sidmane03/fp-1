// src/services/authService.ts
import api from './api';
import type { User, LoginCredentials, RegisterData } from '../types'; // Importing from central types

export const authService = {
  // 1. Login
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // 2. Register
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/users/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // 3. Get Profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // 4. Logout
  logout: () => {
    localStorage.removeItem('token');
  }
};