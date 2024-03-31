import axios from 'axios'

export function dbNames (formData) {
  return axios.post('/mongo/dbNames', formData)
}

export function collections (formData) {
  return axios.post('/mongo/collections', formData)
}

export function writeConcerns (formData) {
  return axios.post('/mongo/writeConcerns', formData)
}
