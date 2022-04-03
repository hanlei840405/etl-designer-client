import axios from 'axios'
export function fetchAllEtlScheduleLogs (pathVar) {
  return axios.post('/schedule-www/scheduleLogs/' + pathVar)
}
