import axios from 'axios'

export function preview (params) {
  return axios.post('/preview', params)
}

export function structure (params) {
  return axios.post('/structure', params)
}

export function headers (params) {
  return axios.post('/headers', params)
}

export function sheets (params) {
  return axios.post('/sheets', params)
}
