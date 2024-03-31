import axios from 'axios'

export function fetchDatasourceList (formData) {
  return axios.post('/datasourceList', formData)
}

export function saveDatasource (formData) {
  return axios.post('/datasource', formData)
}

export function testDatasource (formData) {
  return axios.post('/datasource/test', formData)
}

export function deleteDatasource (pathVar) {
  return axios.delete('/datasource/' + pathVar)
}

export function fetchDatasource (pathVar) {
  return axios.get('/datasource/' + pathVar)
}
