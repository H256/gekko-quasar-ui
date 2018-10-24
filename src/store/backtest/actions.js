import _ from 'lodash'
import moment from 'moment'
/**
 * set the retrieved backtest result
 * @param state
 * @param result
 * @returns {Promise<any>}
 */
export const setBacktestResult = (state, result) => {
  return new Promise((resolve) => {
    // transform to correct js dates
    if(result){
      if(_.has(result,'stratCandles') && result.stratCandles.length > 0){
        let rC = result.stratCandles.map((item)=>{
          item.start = moment.unix(item.start).format('YYYY-MM-DD[\n]HH:mm'); //new Date(item.start);
          return item;
        });
        result.stratCandles = rC;
      }
      if(_.has(result,'stratUpdates') && result.stratUpdates.length > 0){
        let rC = result.stratUpdates.map((item)=>{
          item.date = moment.unix(item.date).format('YYYY-MM-DD[\n]HH:mm');
          return item;
        });
        result.stratUpdates = rC;
      }
      if(_.has(result,'trades') && result.trades.length > 0){
        let rC = result.trades.map((item)=>{
          item.date = moment.unix(item.date).format('YYYY-MM-DD[\n]HH:mm');
          return item;
        });
        result.trades = rC;
      }
    }
    state.commit('setResult', result);
    resolve();
  });
}
