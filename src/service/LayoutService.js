import axios from 'axios'

export function fetchAllLayouts (formData) {
  return axios.post('/layouts', formData)
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

export function show (formData) {
  return axios.post('/layouts/show', formData)
}
