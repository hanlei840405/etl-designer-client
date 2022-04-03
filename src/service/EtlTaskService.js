import axios from 'axios'
export function fetchAllEtlTasks (params) {
  return axios.post('/schedule-www/tasks/', params)
}
export function fetchEtlTask (pathVar) {
  return axios.get('/schedule-www/task/' + pathVar)
}
export function saveEtlTask (formData) {
  return axios.post('/schedule-www/task/submit', formData)
}
export function deleteEtlTask (pathVar) {
  return axios.delete('/schedule-www/task/' + pathVar)
}
export function startEtlTask (params) {
  return axios.put('/schedule-www/task/start', params)
}
export function pauseEtlTask (params) {
  return axios.put('/schedule-www/task/pause', params)
}
export function resumeEtlTask (params) {
  return axios.put('/schedule-www/task/resume', params)
}
export function removeEtlTask (params) {
  return axios.put('/schedule-www/task/remove', params)
}
export function restoreEtlTask (params) {
  return axios.put('/schedule-www/task/restore', params)
}
export function fetchEtlTaskFiles (pathVar) {
  return axios.put('/schedule-www/taskFile/' + pathVar)
}
