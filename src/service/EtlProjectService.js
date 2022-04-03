import axios from 'axios'
export function fetchAllEtlProjects () {
  return axios.post('/designer-www/projects/')
}
export function saveEtlProject (formData) {
  return axios.post('/designer-www/project/', formData)
}
export function deleteEtlProject (pathVar) {
  return axios.delete('/designer-www/project/' + pathVar)
}
export function fetchEtlProject (pathVar) {
  return axios.get('/designer-www/project/' + pathVar)
}
