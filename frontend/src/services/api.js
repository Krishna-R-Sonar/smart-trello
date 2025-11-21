// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://smart-trello.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true
});

export default api;