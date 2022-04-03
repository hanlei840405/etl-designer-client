import axios from 'axios'

export function fetchAllProjects (formData) {
  return axios.post('/projects', formData)
}

export function saveProject (formData) {
  return axios.post('/project', formData)
}

export function deleteProject (pathVar) {
  return axios.delete('/project/' + pathVar)
}

export function fetchProject (pathVar) {
  return axios.get('/project/' + pathVar)
}

export function fetchMembers (pathVar) {
  return axios.get('/project/members/' + pathVar)
}

export function fetchBranch (pathVar) {
  return axios.get('/branch/' + pathVar)
}

export function fetchBranches (pathVar) {
  return axios.get('/branches/' + pathVar)
}

export function saveMember (projectId, userId) {
  return axios.post('/project/member/' + projectId + '/' + userId)
}

export function deleteMember (projectId, userId) {
  return axios.delete('/project/member/' + projectId + '/' + userId)
}

export function quitProject (projectId) {
  return axios.delete('/project/member/' + projectId)
}

export function saveBranch (formData) {
  return axios.post('/branch/', formData)
}

export function deleteBranch (pathVar) {
  return axios.delete('/branch/' + pathVar)
}
