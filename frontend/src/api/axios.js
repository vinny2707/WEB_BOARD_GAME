import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:3000', // Backend API base URL
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;