import axios from 'axios'
export function upload (formData, config) {
  return axios.post('/attachment/upload', formData, config)
}
export function remove (form) {
  return axios.post('/attachment/delete', form)
}
export function preview (form) {
  return axios.post('/attachment/preview', form)
}
export function download (pathVar1, pathVar2, pathVar3, config) {
  return axios.post('/attachment/download/' + pathVar1 + '/' + pathVar2 + '/' + pathVar3, {}, config)
}
