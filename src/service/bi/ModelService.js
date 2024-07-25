import axios from 'axios'

export function fetchModels (formData) {
  return axios.post('/modelList', formData)
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

export function generateSql (pathVar) {
  return axios.get('/generateSql/' + pathVar)
}

export function executeSql (pathVar) {
  return axios.get('/executeSql/' + pathVar)
}
