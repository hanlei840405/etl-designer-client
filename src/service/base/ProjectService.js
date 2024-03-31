import axios from 'axios'

export function fetchProjects (formData) {
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

export function transferProject (projectId, userId) {
  return axios.post('/project/' + projectId + '/owner/' + userId)
}

export function quitProject (pathVar) {
  return axios.post('/project/quit/' + pathVar)
}
