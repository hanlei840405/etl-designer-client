import axios from 'axios'

export function fetchResources (pathVar) {
  return axios.get('/resources/' + pathVar)
}