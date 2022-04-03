import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'
import { Notify } from 'quasar'

const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (to) {
  return VueRouterPush.call(this, to).catch(err => err)
}
Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
let router
export default function (/* { store, ssrContext } */) {
  router = new VueRouter({
    scrollBehavior: () => ({
      x: 0,
      y: 0
    }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })
  router.beforeEach((to, from, next) => {
    let isLogin = false
    let access = false
    const text = localStorage.getItem('authorities')
    if (text) {
      const authorities = text.replace('__q_strn|', '').split(',')
      for (let i = 0; i < authorities.length; i++) {
        if (to.meta.authorities) {
          for (let j = 0; to.meta.authorities && j < to.meta.authorities.length; j++) {
            if (authorities[i] === to.meta.authorities[j]) {
              access = true
              break
            }
          }
        } else {
          access = true
          break
        }
      }
    }
    if (!access && !to.meta.authorities) {
      access = true
    }
    if (localStorage.getItem('token')) {
      isLogin = true
    }
    if (to.path === '/login' || to.path === '/register' || to.path === '/forgot' || to.path === '/reset') {
      next()
    } else if (isLogin) {
      if (access) {
        next()
      } else {
        Notify.create({
          message: '您未经过系统授权操作本页面!',
          position: 'top',
          color: 'negative'
        })
      }
    } else {
      next('/login')
    }
  })
  return router
}
export { router }
