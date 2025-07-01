import axios from 'axios'

export function fetchApplyList (formData) {
  return axios.post('/applyPage', formData)
}

export function fetchAuditList (formData) {
  return axios.post('/applyPage', formData)
}

export function apply (formData) {
  return axios.post('/apply', formData)
}

export function audit (formData) {
  return axios.post('/audit', formData)
}

export function deleteApply (pathVar1) {
  return axios.delete('/apply/' + pathVar1)
}
