import axios from 'axios'

export function testConnection (formData) {
  return axios.post('/elasticSearch/test', formData)
}
