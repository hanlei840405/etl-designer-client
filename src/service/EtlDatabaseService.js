import axios from 'axios'
export function fetchAllEtlDatabases (params) {
  return axios.post('/designer-www/databases', params)
}
export function fetchEtlDatabase (databaseId) {
  return axios.get('/designer-www/database/' + databaseId)
}
export function saveEtlDatabase (formData) {
  return axios.post('/designer-www/database', formData)
}
