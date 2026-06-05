import axios from 'axios';
const API_URL = '/api';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const login = (username, password) => api.post('/auth/login', { username, password });
export const getQuizzes = () => api.get('/quizzes');
export const getQuiz = (id) => api.get(`/quizzes/${id}`);
export const createQuiz = (quiz) => api.post('/quizzes', quiz);
export const updateQuiz = (id, quiz) => api.put(`/quizzes/${id}`, quiz);
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);
export const uploadImage = (formData) => api.post('/quizzes/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export default api;
