import Vue from 'vue'
import axios from 'axios'
import { LocalStorage, Notify } from 'quasar'
import { router } from '../router/index'
axios.interceptors.request.use(
  config => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    config.baseURL = process.env.API
    config.withCredentials = true
    if (LocalStorage.getItem('token')) {
      config.headers.Authorization = 'Bearer ' + LocalStorage.getItem('token')
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)
axios.interceptors.response.use((response) => {
  return response
},
function (error) {
  if (error.response.status === 401) {
    Notify.create({
      message: '您的账号已过期，请重新登录!',
      position: 'top',
      color: 'negative'
    })
    LocalStorage.remove('token')
    router.push('/login')
  } else if (error.response.status === 403) {
    Notify.create({
      message: '您未经过系统授权操作本页面!',
      position: 'top',
      color: 'negative'
    })
    router.go(-1)
  }
  return Promise.reject(error.response)
})
Vue.prototype.$axios = axios
