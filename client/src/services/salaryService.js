import api from './api'
export const getSalaries    = (params)    => api.get('/salaries', { params })
export const getSalaryRecap = (params)    => api.get('/salaries/recap', { params })
export const createSalary   = (data)      => api.post('/salaries', data)
export const genererMois    = (data)      => api.post('/salaries/generer-mois', data)
export const payerSalaire   = (id)        => api.patch(`/salaries/${id}/payer`)
export const updateSalary   = (id, data)  => api.put(`/salaries/${id}`, data)
export const deleteSalary   = (id)        => api.delete(`/salaries/${id}`)