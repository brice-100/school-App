import api from './api';
export const getPayments = (params) => api.get('/payments', { params });
export const getMyPayments = () => api.get('/payments/mine');
export const createPayment = (data) =>
  api.post('/payments', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const addTranche = (id, data) =>
  api.put(`/payments/${id}/tranche`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePayment = (id) => api.delete(`/payments/${id}`);