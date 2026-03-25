import api from './api'

export const getPlanningFormData   = ()            => api.get('/planning/form-data')
export const getPlanningByClasse   = (classe_id)   => api.get(`/planning/classe/${classe_id}`)
export const getPlanningByTeacher  = (teacher_id)  => api.get(`/planning/teacher/${teacher_id}`)
export const getMyPlanning         = ()            => api.get('/planning/mine')
export const createPlanning        = (data)        => api.post('/planning', data)
export const updatePlanning        = (id, data)    => api.put(`/planning/${id}`, data)
export const deletePlanning        = (id)          => api.delete(`/planning/${id}`)