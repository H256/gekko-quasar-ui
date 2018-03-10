import _ from 'lodash'

export const syncStratrunners = ({ commit }, data) => {
    let runners = _.filter(data, { type: 'leech' });
    commit('syncStratrunners', data);
}

export const addStratrunner = ({ commit }, data) => {
    commit('addStratrunner', data.gekko);
}

export const updateStratrunner = ({ commit }, data) => {
    commit('updateStratrunner', data);
}

export const addTradeToStratrunner = ({ commit }, data) => {
    commit('addTradeToStratrunner', data);
}

export const addRoundtripToStratrunner = ({ commit }, data) => {
    commit('addRoundtripToStratrunner', data);
}