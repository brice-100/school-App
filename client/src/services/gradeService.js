import api from './api'

export const getGradeFormData  = ()              => api.get('/grades/form-data')
export const getGrades         = (params)        => api.get('/grades', { params })
export const getGradesByStudent = (id, params)   => api.get(`/grades/student/${id}`, { params })
export const getGradeStats     = (classe_id, p)  => api.get(`/grades/stats/${classe_id}`, { params: p })
export const createGrade       = (data)          => api.post('/grades', data)
export const updateGrade       = (id, data)      => api.put(`/grades/${id}`, data)
export const validerGrades     = (ids)           => api.patch('/grades/valider', { ids })
export const deleteGrade       = (id)            => api.delete(`/grades/${id}`)