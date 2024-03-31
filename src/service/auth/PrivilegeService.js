import axios from 'axios'

export function fetchPrivileges (formData) {
  return axios.post('/privileges', formData)
}

export function savePrivilege (formData) {
  return axios.post('/privilege', formData)
}

export function fetchPrivilege (pathVar) {
  return axios.get('/privilege/' + pathVar)
}

export function grant (formData) {
  return axios.post('/grant', formData)
}

export function grantByResource (formData) {
  return axios.post('/grantByResource', formData)
}

export function fetchGrantUsersByResource (pathVar1, pathVar2, pathVar3) {
  return axios.get('/grant/' + pathVar1 + '/' + pathVar2 + '/' + pathVar3)
}

export function fetchGrantUsers (privilegeId) {
  return axios.get('/grant/' + privilegeId)
}

export function deleteGrantUsers (pathVar1, pathVar2, pathVar3, pathVar4) {
  return axios.delete('/grant/' + pathVar1 + '/' + pathVar2 + '/' + pathVar3 + '/' + pathVar4)
}

export function deletePrivilege (pathVar1, pathVar2) {
  return axios.delete('/grant/' + pathVar1 + '/' + pathVar2)
}
