import axios from 'axios'

export function fetchAttamentStorageDir (formData) {
  return axios.post('/attachmentStorageList', formData)
}
