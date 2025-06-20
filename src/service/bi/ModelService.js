import axios from 'axios'

export function fetchModels (formData) {
  return axios.post('/modelList', formData)
}

export function paginationModels (formData) {
  return axios.post('/modelPage', formData)
}

export function saveModel (formData) {
  return axios.post('/model', formData)
}

export function deleteModel (pathVar) {
  return axios.delete('/model/' + pathVar)
}

export function fetchModel (pathVar) {
  return axios.get('/model/' + pathVar)
}

export function sql (formData) {
  return axios.post('/model/sql', formData)
}

export function publishModel (formData) {
  return axios.post('/model/publish', formData)
}

