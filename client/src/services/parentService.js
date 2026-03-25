import api from './api'
export const getParents   = (params)    => api.get('/parents', { params })
export const getParent    = (id)        => api.get(`/parents/${id}`)
export const createParent = (formData)  => api.post('/parents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const updateParent = (id, fd)    => api.put(`/parents/${id}`, fd, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteParent = (id)        => api.delete(`/parents/${id}`)