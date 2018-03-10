import _ from 'lodash'

export const initWatchers = ({commit}, response) => {
    let watchers = _.filter(response, {type: 'watcher'});
    commit('syncWatchers', watchers);
}

export const addWatcher = ({commit}, data) => {
    if(data.gekko.type === 'watcher')
        commit('addWatcher', data.gekko);
}

export const updateWatcher = ({commit}, data) => {
    commit('updateWatcher', data);
}