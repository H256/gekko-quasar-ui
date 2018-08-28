import _ from 'lodash'

/**
 * set the retrieved backtest result
 * @param state
 * @param result
 * @returns {Promise<any>}
 */
export const setBacktestResult = (state, result) => {
  return new Promise((resolve) => {
    state.commit('setResult', result);
    resolve();
  });
}
