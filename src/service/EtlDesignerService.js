import axios from 'axios'
export function executeTrans (params) {
  return axios.post('/designer-www/execute/trans', params)
}
export function executeJob (params) {
  return axios.post('/designer-www/execute/job', params)
}
export function transLog (pathVar) {
  return axios.get('/designer-www/log/trans' + pathVar)
}
export function jobLog (pathVar) {
  return axios.get('/designer-www/log/job' + pathVar)
}
export function saveTrans (params) {
  return axios.post('/designer-www/execute/job', params)
}
export function saveJob (params) {
  return axios.post('/designer-www/execute/job', params)
}
export function preview (params) {
  return axios.post('/designer-www/preview', params)
}
