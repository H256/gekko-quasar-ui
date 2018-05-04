import Vue from 'vue'

export const addWatcher = (state, watcher) => {
    state.watchers.push(watcher);
    return state;
}

export const syncWatchers = (state, watchers) => {
    state.watchers = watchers;
    return state;
}

export const updateWatcher = (state, update) => {
    let index = state.watchers.findIndex(i => i.id === update.gekko_id);
    let item = state.watchers[index];
    if (!item)
        return state;

    let updated = Vue.util.extend(item, update.updates);
    Vue.set(state.watchers,index, updated);

    return state;
}

export const removeWatcher = (state, idToRemove) => {
  state.watchers =_.filter(state.watchers, function(r) {
    return r.id.toString() !== idToRemove.toString();
  });
}
