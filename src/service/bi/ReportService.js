import axios from 'axios'

export function fetchReports (formData) {
  return axios.post('/reportList', formData)
}

export function paginationReports (formData) {
  return axios.post('/reportPage', formData)
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

export function viewReport (formData) {
  return axios.post('/report/view', formData)
}

export function paintReportByPost (formData) {
  return axios.post('/report/paint', formData)
}

export function paintReportByGet (pathVar) {
  return axios.get('/report/paint/' + pathVar)
}