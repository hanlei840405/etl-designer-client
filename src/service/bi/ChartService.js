import axios from 'axios'

export function fetchCharts (formData) {
  return axios.post('/chartList', formData)
}

export function paginationCharts (formData) {
  return axios.post('/chartPage', formData)
}

export function saveChart (formData) {
  return axios.post('/chart', formData)
}

export function deleteChart (pathVar) {
  return axios.delete('/chart/' + pathVar)
}

export function fetchChart (pathVar) {
  return axios.get('/chart/' + pathVar)
}

export function previewChart (formData) {
  return axios.post('/chart/preview', formData)
}
