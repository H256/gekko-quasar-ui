import _ from 'lodash'

export const setBacktestResult = (state, result) => {
  return new Promise((resolve)=>{
    state.commit('setResult', result);
    resolve();
  });
}

export const extendAndFixCandles = ({state, commit}) => {
  return new Promise((resolve)=>{
    let candleArray = [];

    if (!_.isEmpty(state.backtestResult.indicatorResults)) {
      candleArray = _.clone(state.backtestResult.candles);
      _.each(Object.keys(state.backtestResult.indicatorResults), function (item) {
        let ind = state.backtestResult.indicatorResults[item];

        ind.forEach(function (indicatorResult, idx) {
          if (!_.isEmpty(indicatorResult.result) || (!_.isNull(indicatorResult.result) && !_.isUndefined(indicatorResult.result))) {
            if (_.isObject(indicatorResult.result)) {
              let k = Object.keys(indicatorResult.result);
              _.each(k, function (it) {
                let o = {};
                if (!(it === 'result')) {
                  o['name'] = item + '_' + it;
                  o['group'] = indicatorResult.indicator === null ? item : indicatorResult.indicator;
                  o['type'] = 'number';
                  o['displayName'] = item + ' (' + it + ', ' + indicatorResult.baseType + ')';
                } else {
                  o['name'] = item;
                  o['group'] = indicatorResult.indicator === null ? item : indicatorResult.indicator;
                  o['type'] = 'number';
                  o['displayName'] = item + ' (' + indicatorResult.baseType + ')';
                }

                // add result value to candle-array
                candleArray[idx][o.name] = indicatorResult.result[it];
              })
            } else {
              let o = {};
              o['name'] = item;
              o['group'] = indicatorResult.indicator === null ? item : indicatorResult.indicator;
              o['type'] = "number";
              o['displayName'] = item + ' (native)';

              // add result value to candle-array
              candleArray[idx][o.name] = indicatorResult.result;
            }
          }
        });
      });
    }

    // fix candles so that all candles have at least the required properties
    // get this info from last candle - there should be all values inside...
    let vToCheck = Object.keys(candleArray[candleArray.length - 1]);
    candleArray.forEach(function (candle) {
      vToCheck.forEach(function (p) {
        if (!_.has(candle, p)) _.set(candle, p, null);
      })
    });

    commit('setFixedCandles', candleArray);
    resolve();
  });
};

