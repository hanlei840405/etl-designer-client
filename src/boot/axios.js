import Vue from 'vue'
import axios from 'axios'
import { router } from '../router/index'
import { Cookies, Notify, Loading } from 'quasar'
import { i18n } from './i18n'

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
  if (Loading.isActive) {
    Loading.hide()
  }
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
    } else if (error.response.status === 10001) {
      Notify.create({
        message: i18n.t('response.error.10001'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10002) {
      Notify.create({
        message: i18n.t('response.error.10002'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10003) {
      Notify.create({
        message: i18n.t('response.error.10003'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10004) {
      Notify.create({
        message: i18n.t('response.error.10004'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10005) {
      Notify.create({
        message: i18n.t('response.error.10005'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10006) {
      Notify.create({
        message: i18n.t('response.error.10006', [error.response.data]),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10007) {
      Notify.create({
        message: i18n.t('response.error.10007'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10008) {
      Notify.create({
        message: i18n.t('response.error.10008'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10009) {
      Notify.create({
        message: i18n.t('response.error.10009'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 100010) {
      Notify.create({
        message: i18n.t('response.error.100010'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10011) {
      Notify.create({
        message: i18n.t('response.error.10011'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10012) {
      Notify.create({
        message: i18n.t('response.error.10012'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10013) {
      Notify.create({
        message: i18n.t('response.error.10013'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10014) {
      Notify.create({
        message: i18n.t('response.error.10014'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10015) {
      Notify.create({
        message: i18n.t('response.error.10015'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10016) {
      Notify.create({
        message: i18n.t('response.error.10016'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10017) {
      Notify.create({
        message: i18n.t('response.error.10017'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10018) {
      Notify.create({
        message: i18n.t('response.error.10018', [error.response.data]),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.status === 10019) {
      Notify.create({
        message: i18n.t('response.error.10019'),
        position: 'top',
        color: 'negative'
      })
    } else if (error.response.data) {
      Notify.create({
        message: error.response.data.error,
        position: 'top',
        color: 'negative'
      })
    } else {
      Notify.create({
        message: i18n.t('response.error.10000'),
        position: 'top',
        color: 'negative'
      })
    }
    return Promise.reject(error.response)
  } else {
    Notify.create({
      message: i18n.t(error.message),
      position: 'top',
      color: 'negative'
    })
    return Promise.reject(error)
  }
})
Vue.prototype.$axios = axios
