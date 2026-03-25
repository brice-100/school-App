import api from './api';

export const getStudents = (params) => api.get('/students', { params });
export const getStudent = (id) => api.get(`/students/${id}`);
export const createStudent = (formData) =>
  api.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateStudent = (id, formData) =>
  api.put(`/students/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteStudent = (id) => api.delete(`/students/${id}`);