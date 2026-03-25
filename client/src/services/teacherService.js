import api from './api'

export const getTeachers   = (params)   => api.get('/teachers', { params })
export const getTeacher    = (id)       => api.get(`/teachers/${id}`)
export const createTeacher = (formData) => api.post('/teachers', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const updateTeacher = (id, formData) => api.put(`/teachers/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`)