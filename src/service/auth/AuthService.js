import axios from 'axios'
export function register (form) {
  return axios.post('/register', form)
}
export function login (form) {
  return axios.post('/authenticate', form)
}
export function forgot (form) {
  return axios.post('/forgot', form)
}
export function reset (form) {
  return axios.post('/reset', form)
}
export function me () {
  return axios.get('/me')
}
export function changePwd (form) {
  return axios.post('/password', form)
}
export function fetchAllUsers (params) {
  return axios.post('/users', params)
}
export function fetchUser (id) {
  return axios.get('/user/' + id)
}
export function saveUser (form) {
  return axios.post('/user', form)
}
export function lockUser (id) {
  return axios.put('/user/' + id)
}
export function deleteUser (id) {
  return axios.delete('/user/' + id)
}
export function fetchGrantedPrivileges (id) {
  return axios.get('/privileges/user/' + id)
}
export function fetchPrivilegesByResourceId (id) {
  return axios.get('/privileges/resource/' + id)
}
export function grantPrivileges (form) {
  return axios.post('/grant', form)
}
