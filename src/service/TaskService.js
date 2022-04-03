import axios from 'axios'

export function online (formData) {
  return axios.post('/online', formData)
}

export function pause (pathVar) {
  return axios.put('/task/pause/' + pathVar)
}

export function resume (pathVar) {
  return axios.put('/task/resume/' + pathVar)
}

export function remove (pathVar) {
  return axios.delete('/task/delete/' + pathVar)
}

export function logs (pathVar, batch) {
  if (batch) {
    return axios.get('/task/batch/logs/' + pathVar)
  }
  return axios.get('/task/streaming/log/' + pathVar)
}

export function log (pathVar1, pathVar2) {
  return axios.get('/task/batch/log/' + pathVar1 + '/' + pathVar2)
}
