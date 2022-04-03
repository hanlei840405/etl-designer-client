import axios from 'axios'

export function fetchAllReports (formData) {
  return axios.post('/reports', formData)
}

export function showActiveReports (formData) {
  return axios.post('/reports/show', formData)
}

export function saveReport (formData) {
  return axios.post('/report', formData)
}

export function deleteReport (pathVar) {
  return axios.delete('/report/' + pathVar)
}

export function fetchReport (pathVar) {
  return axios.get('/report/' + pathVar)
}

export function deploy (formData) {
  return axios.post('/reports/deploy', formData)
}
