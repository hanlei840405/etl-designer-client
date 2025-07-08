import axios from 'axios'

export function paginationLayouts (formData) {
  return axios.post('/layoutPage', formData)
}

export function saveLayout (formData) {
  return axios.post('/layout', formData)
}

export function deleteLayout (pathVar) {
  return axios.delete('/layout/' + pathVar)
}

export function fetchLayout (pathVar) {
  return axios.get('/layout/' + pathVar)
}
