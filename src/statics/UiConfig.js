// This config is used in both the
// frontend as well as the web server.

// see https://github.com/askmike/gekko/blob/stable/docs/installing_gekko_on_a_server.md

const CONFIG = {
    headless: false,
    api: {
      host: '127.0.0.1',
      port: 3000,
      timeout: 10 * 60 * 1000 // 10 minutes
    },
    ui: {
      ssl: false,
      host: '127.0.0.1',
      port: 3000,
      path: '/'
    },
    adapter: 'sqlite',

  /**
   * Gordon UI - configure your additional Indicator names here
   * (standard TA-Lib and Tulip ones are already defined)
   * patterns: for Pattern-Recognizing indicators
   * indicators: for RSI and so on - should not be displayed as Overlay
   * overlays: all Indicators that can be put into the main-chart as overlay, for Example SMA, EMA, Bollinger-Bands etc.
   * Example-Configuration done for tulip-macd - strat
   */
    userChartConfig: {
      //patterns:['hasInvertedHammer']
      indicators: ['mymacd', 'mymacdSignal', 'macdHistogram', 'mystdev'],
      //overlays: []
    }
  };

  if(typeof window === 'undefined')
    module.exports = CONFIG;
  else
    window.CONFIG = CONFIG;
