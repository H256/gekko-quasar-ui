import Vue from 'vue'
import Vuex from 'vuex'

import config from './config'
import watchers from './watchers'
import imports from './imports'
import warnings from './warnings'
import stratrunners from './stratrunners'
import backtest from './backtest'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    config,
    watchers,
    imports,
    warnings,
    stratrunners,
    backtest
  }
})


export default store
