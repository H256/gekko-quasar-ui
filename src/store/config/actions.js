const transformMarkets = backendData => {
  var exchangesRaw = backendData;
  var exchangesTemp = {};

  exchangesRaw.forEach(e => {
    exchangesTemp[e.slug] = exchangesTemp[e.slug] || {markets: {}};

    e.markets.forEach( pair => {
      let [ currency, asset ] = pair['pair'];
      exchangesTemp[e.slug].markets[currency] = exchangesTemp[e.slug].markets[currency] || [];
      exchangesTemp[e.slug].markets[currency].push( asset );
    });

    if("exchangeMaxHistoryAge" in e){
      exchangesTemp[e.slug].exchangeMaxHistoryAge = e.exchangeMaxHistoryAge;
    }

    exchangesTemp[e.slug].importable = e.providesFullHistory ? true : false;
    exchangesTemp[e.slug].tradable = e.tradable ? true : false;
    exchangesTemp[e.slug].requires = e.requires;
  });

  return exchangesTemp;
}

export const initApiKeys = ({commit}, apiKeys) => {
   commit('syncApiKeys', apiKeys);
}

export const initExchanges = ({commit}, exchanges) => {
    commit('syncExchanges', transformMarkets(exchanges));
}