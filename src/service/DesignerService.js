import axios from 'axios'
export function saveTransform (params) {
  return axios.post('/designer/transform', params)
}
export function saveJob (params) {
  return axios.post('/designer/job', params)
}
export function execute (pathVar, params, config) {
  return axios.post('/designer/execute/' + pathVar, params, config)
}
export function stop (params) {
  return axios.post('/designer/stop', params)
}
export function transformLog (pathVar) {
  return axios.get('/designer/log/' + pathVar)
}
