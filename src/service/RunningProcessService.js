import axios from 'axios'

export function fetchRunningProcess (form) {
  return axios.post('/runningProcesses', form)
}

export function shutdownRunningProcess (pathVar) {
  return axios.delete('/runningProcess/' + pathVar)
}
