import axios from 'axios';
import { env } from "./env";

const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL, // FastAPI backend URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
