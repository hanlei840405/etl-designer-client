import axios from 'axios'

export function fetchUsers (formData) {
  return axios.post('/users', formData)
}

export function fetchUser (pathvar) {
  return axios.get('/user/' + pathvar)
}

export function saveUser (formData) {
  return axios.post('/user', formData)
}

export function deleteUser (pathvar) {
  return axios.delete('/user/' + pathvar)
}
