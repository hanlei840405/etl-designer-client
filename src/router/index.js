import Vue from 'vue'
import VueRouter from 'vue-router'
import { Cookies, Notify } from 'quasar'

import routes from './routes'
import { i18n } from 'src/boot/i18n'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

//replace
VueRouter.prototype.replace = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => err)
}
const router = new VueRouter({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes,

  // Leave these as they are and change in quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
})
export default function (/* { store, ssrContext } */) {
  router.beforeEach((to, from, next) => {
    let isLogin = false
    let access = false
    const authorities = Cookies.get('authorities') || []
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
    // if (!access && to.meta.authorities) {
    //   access = true
    // }
    if (Cookies.get('token')) {
      isLogin = true
    }
    if (to.path === '/login' || to.path === '/register' || to.path === '/forgot' || to.path === '/reset') {
      next()
    } else if (isLogin) {
      if (access) {
        next()
      } else {
        Notify.create({
          message: i18n.t('global.not_authorized'),
          position: 'top',
          color: 'negative'
        })
        next(from.path)
      }
    } else {
      next('/login')
    }
  })
  return router
}
export { router }
