import axios from 'axios'

export function fetchFtpList (formData) {
  return axios.post('/ftpList', formData)
}

export function saveFtp (formData) {
  return axios.post('/ftp', formData)
}

export function testFtp (formData) {
  return axios.post('/ftp/test', formData)
}

export function deleteFtp (pathVar) {
  return axios.delete('/ftp/' + pathVar)
}

export function fetchFtp (pathVar) {
  return axios.get('/ftp/' + pathVar)
}
