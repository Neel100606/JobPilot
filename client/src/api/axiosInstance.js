import axios from 'axios';

// Create base instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Point to your backend
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;