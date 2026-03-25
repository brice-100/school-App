import api from './api'
export const getUsers        = (params)         => api.get('/users', { params })
export const updateStatut    = (id, statut)     => api.patch(`/users/${id}/statut`, { statut })
export const updateUser      = (id, formData)   => api.put(`/users/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteUser      = (id)             => api.delete(`/users/${id}`)
export const getPendingCount = ()               => api.get('/users/pending-count')