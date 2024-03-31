import axios from 'axios'

export function fetchShellsByProject (pathVar) {
  return axios.get('/shells/' + pathVar)
}
export function fetchShellsByParent (pathVar1, pathVar2) {
  return axios.get('/shells/' + pathVar1 + "/" + pathVar2)
}

export function saveShell (formData) {
  return axios.post('/shell', formData)
}

export function deleteShell (pathVar) {
  return axios.delete('/shell/' + pathVar)
}

export function fetchShell (pathVar) {
  return axios.get('/shell/' + pathVar)
}

export function fetchShellContent (pathVar) {
  return axios.get('/shell/content/' + pathVar)
}

export function move (pathVar, formData) {
  return axios.post('/moveShells/' + pathVar, formData)
}

export function saveShellContent (formData) {
  return axios.post('/shell/content', formData)
}

export function publishShell (formData) {
  return axios.post('/shell/publish', formData)
}

export function fetchShellPublishes (formData) {
  return axios.post('/publishes', formData)
}

export function fetchShellPublishContent (pathVar) {
  return axios.get('/publish/content/' + pathVar)
}

export function fetchShellPublishReferences (formData) {
  return axios.post('/references', formData)
}

export function deployShellPublish (formData) {
  return axios.post('/deploy', formData)
}