import Vue from 'vue'
import Vuex from 'vuex'

import config from './config'
import watchers from './watchers'
import imports from './imports'
import warnings from './warnings'
import stratrunners from './stratrunners'

Vue.use(Vuex)

// Stub for Websocket-Connection... see App.vue for real Bootstrappin of Events etc.
export function initializeState() {
  return true
}

const store = new Vuex.Store({
  modules: {
    config,
    watchers,
    imports,
    warnings,
    stratrunners
  }
})


export default store
