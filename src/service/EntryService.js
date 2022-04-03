import axios from 'axios'

export function fetchAllEntries () {
  return axios.get('/entries')
}
