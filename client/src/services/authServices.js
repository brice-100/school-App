import api from './api';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerTeacher = (formData) =>
  api.post('/auth/register/teacher', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const registerParent = (formData) =>
  api.post('/auth/register/parent', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMe = () => api.get('/auth/me');