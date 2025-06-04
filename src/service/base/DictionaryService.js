import axios from 'axios'

export function fetchDictionaries (formData) {
  return axios.post('/dictionaries', formData)
}

export function saveDictionary (formData) {
  return axios.post('/dictionary', formData)
}

export function deleteDictionary (pathVar) {
  return axios.delete('/dictionary/' + pathVar)
}

export function fetchDictionary (pathVar) {
  return axios.get('/dictionary/' + pathVar)
}

export function fetchDictionaryItemList (pathVar) {
  return axios.get('/dictionaryItems/' + pathVar)
}
