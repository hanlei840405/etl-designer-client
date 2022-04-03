import axios from 'axios'

export function historyLogs (form) {
  return axios.post('/history/logs/', form)
}

export function historySteps (pathVar1, pathVar2) {
  return axios.get('/history/steps/' + pathVar1 + '/' + pathVar2)
}

export function historyStep (pathVar1, pathVar2) {
  return axios.get('/history/step/' + pathVar1 + '/' + pathVar2)
}

export function historyLogDetail (pathVar1, pathVar2) {
  return axios.get('/history/detail/' + pathVar1 + '/' + pathVar2)
}
