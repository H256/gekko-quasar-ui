export const setResult = (state, result) => {
  state.backtestResult = result;
}

export const setFixedCandles = (state, result) => {
  state.backtestResult.stratCandles = result;
}

