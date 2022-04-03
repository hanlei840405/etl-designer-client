import axios from 'axios'

export function fetchAllShell (pathVar) {
  return axios.post('/shells/' + pathVar)
}

export function saveShell (formData) {
  return axios.post('/shell', formData)
}

export function publishShell (formData) {
  return axios.post('/shell/publish', formData)
}

export function saveShellContent (formData) {
  return axios.post('/shell/content', formData)
}

export function deleteShell (pathVar) {
  return axios.delete('/shell/' + pathVar)
}

export function fetchShell (pathVar) {
  return axios.get('/shell/' + pathVar)
}

export function fetchShellSource (pathVar) {
  return axios.get('/shell/source/' + pathVar)
}

export function fetchPublishes (formData) {
  return axios.post('/publishes', formData)
}

export function fetchReferencePublishes (formData) {
  return axios.post('/referencePublishes', formData)
}

export function deploy (formData) {
  return axios.post('/deploy', formData)
}
