import axios from 'axios'

export function fetchAllToolbars (id) {
  return axios.get('/toolbars/' + id)
}
