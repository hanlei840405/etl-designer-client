import axios from 'axios'
export function saveTransform (params) {
  return axios.post('/design/transform', params)
}
export function saveJob (params) {
  return axios.post('/design/job', params)
}
export function execute (pathVar, params, config) {
  return axios.post('/design/execute/' + pathVar, params, config)
}
export function stop (params) {
  return axios.post('/design/stop', params)
}
export function transformLog (pathVar) {
  return axios.get('/design/log/' + pathVar)
}
