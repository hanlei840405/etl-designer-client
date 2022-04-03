import axios from 'axios'
export function searchAllGitProjects (params) {
  return axios.post('/gitlab-www/projects', params)
}
export function searchGitProjectBranches (params) {
  return axios.post('/gitlab-www/project/branches', params)
}
export function searchGitProjectUsers (params) {
  return axios.post('/gitlab-www/project/users', params)
}
export function searchAllGitFiles (params) {
  return axios.post('/gitlab-www/files', params)
}
export function fetchGitProject (pathVar) {
  return axios.get('/gitlab-www/project/' + pathVar)
}
export function saveGitProject (formData) {
  return axios.post('/gitlab-www/project', formData)
}
export function deleteGitProject (formData) {
  return axios.delete('/gitlab-www/project', formData)
}
export function deleteGitProjectBranch (formData) {
  return axios.delete('/gitlab-www/branch', formData)
}
export function deleteGitProjectUser (formData) {
  return axios.delete('/gitlab-www/user', formData)
}
export function fetchToken () {
  return axios.get('/gitlab-www/token')
}
export function saveToken (formData) {
  return axios.post('/gitlab-www/token', formData)
}
