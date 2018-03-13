import Vue from 'vue'
import Vuex from 'vuex'

import config from './config'
import watchers from './watchers'
import imports from './imports'
import warnings from './warnings'
import stratrunners from './stratrunners'

Vue.use(Vuex)

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
