import _ from 'lodash'

export const initWatchers = ({commit}, response) => {
    let watchers = _.filter(response, {type: 'watcher'});
    commit('syncWatchers', watchers);
}

export const addWatcher = ({commit}, data) => {
    commit('addWatcher', data);
}

export const updateWatcher = ({commit}, data) => {
    commit('updateWatcher', data);
}