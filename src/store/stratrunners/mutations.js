import Vue from 'vue'
import _ from 'lodash'

export const addStratrunner = (state, runner) => {
    state.stratrunners.push(runner);
    return state;
}

export const syncStratrunners = (state, runners) => {
    state.stratrunners = runners;
    return state;
}

export const updateStratrunner = (state, update) => {
    let index = state.stratrunners.findIndex(i => i.id === update.gekko_id);
    let item = state.stratrunners[index];
    if (!item)
        return state;

    let updated = Vue.util.extend(item, update.updates);
    Vue.set(state.stratrunners, index, updated);

    return state;
}
export const addTradeToStratrunner = (state, update) => {
    let index = state.stratrunners.findIndex(i => i.id === update.gekko_id);
    let item = state.stratrunners[index];
    if (!item)
        return state;

    let updated = Vue.util.extend({}, item);
    updated.trades.push(update.trade);
    Vue.set(state.stratrunners, index, updated);

    return state;
}

export const addRoundtripToStratrunner = (state, update) => {
    let index = state.stratrunners.findIndex(i => i.id === update.gekko_id);
    let item = state.stratrunners[index];
    if (!item)
        return state;

    let updated = Vue.util.extend({}, item);
    updated.roundtrips.push(update.roundtrip);
    Vue.set(state.stratrunners, index, updated);

    return state;
}

export const removeRunner = (state, idToRemove) => {
  state.stratrunners =_.filter(state.stratrunners, function(r) {
    return r.id.toString() !== idToRemove.toString();
  });
}
