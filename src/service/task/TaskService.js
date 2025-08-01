import axios from 'axios'

export function fetchBatchTasks (formData) {
  return axios.post('/task/batches', formData)
}

export function fetchStreamingTasks (formData) {
  return axios.post('/task/streaming', formData)
}

export function fetchRuningProcess (formData) {
  return axios.post('/process/running', formData)
}

export function pauseBatchTask (formData) {
  return axios.post('/task/pause', formData)
}

export function resumeBatchTask (formData) {
  return axios.post('/task/resume', formData)
}

export function stopTask (formData) {
  return axios.post('/task/stop', formData)
}

export function modifyBatchTask (formData) {
  return axios.post('/task/modify', formData)
}

export function fetchHistory (formData) {
  return axios.post('/task/batch/history', formData)
}

export function fetchHistoryLog (pathVar) {
  return axios.get('/task/batch/logs/' + pathVar)
}

export function shutdownRunningInstance (formData) {
  return axios.post('/process/shutdown', formData)
}
