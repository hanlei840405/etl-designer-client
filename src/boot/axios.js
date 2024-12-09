import Vue from 'vue'
import axios from 'axios'
import { router } from '../router/index'
import { Cookies, Notify } from 'quasar'

axios.interceptors.request.use(
  config => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    config.baseURL = process.env.API
    config.withCredentials = true
    if (Cookies.get('token')) {
      config.headers.Authorization = 'Bearer ' + Cookies.get('token')
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
  if (error.response) {
    if (error.response.status === 401) {
      Notify.create({
        message: '您的账号已过期，请重新登录!',
        position: 'top',
        color: 'negative'
      })
      Cookies.remove('token')
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
  } else {
    return Promise.reject(error.message)
  }
})
Vue.prototype.$axios = axios
