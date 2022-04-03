import Vue from 'vue'
import Vuex from 'vuex'

import etl from './etl'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */
let store
export default function (/* { ssrContext } */) {
  store = new Vuex.Store({
    modules: {
      etl
    },
    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })
  return store
}
export { store }
