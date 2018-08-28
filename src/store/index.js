import Vue from 'vue'
import Vuex from 'vuex'

import config from './config'
import imports from './imports'
import warnings from './warnings'
import backtest from './backtest'
import gekkos from './gekkos'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    config,
    imports,
    warnings,
    backtest,
    gekkos
  }
})


export default store
