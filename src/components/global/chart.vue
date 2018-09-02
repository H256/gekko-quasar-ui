<template>
  <div v-if="candles.length">
    <h4>Market graph</h4>
    <chart :options="dynOptions" auto-resize ref="chart" class="full-width" ></chart>
  </div>
</template>

<script>
  import _ from "lodash";
  import ECharts from 'vue-echarts'
  import {result} from "../../store/backtest/getters";

  const userIndicators = (window.CONFIG.userChartConfig && window.CONFIG.userChartConfig.indicators) || [];
  const userPatterns = (window.CONFIG.userChartConfig && window.CONFIG.userChartConfig.patterns) || [];
  const userOverlays = (window.CONFIG.userChartConfig && window.CONFIG.userChartConfig.overlays) || [];

  const chartOverlays = [
    ...userOverlays,
    'avgprice',
    'bbands',
    'dema',
    'ema',
    'hma',
    'kama',
    'linreg',
    'ma',
    'mama',
    'medprice',
    'midprice',
    'psar',
    'sma',
    't3',
    'tema',
    'trima',
    'tsf',
    'typprice',
    'vidya',
    'vwma',
    'wclprice',
    'wcprice',
    'wilders',
    'wma',
    'zlema'
  ];
  const chartPatterns = [
    ...userPatterns,
    'cdl2crows',
    'cdl3blackcrows',
    'cdl3inside',
    'cdl3linestrike',
    'cdl3outside',
    'cdl3starsinsouth',
    'cdl3whitesoldiers',
    'cdlabandonedbaby',
    'cdladvanceblock',
    'cdlbelthold',
    'cdlbreakaway',
    'cdlclosingmarubozu',
    'cdlconcealbabyswall',
    'cdlcounterattack',
    'cdldarkcloudcover',
    'cdldoji',
    'cdldojistar',
    'cdldragonflydoji',
    'cdlengulfing',
    'cdleveningdojistar',
    'cdleveningstar',
    'cdlgapsidesidewhite',
    'cdlgravestonedoji',
    'cdlhammer',
    'cdlhangingman',
    'cdlharami',
    'cdlharamicross',
    'cdlhighwave',
    'cdlhikkake',
    'cdlhikkakemod',
    'cdlhomingpigeon',
    'cdlidentical3crows',
    'cdlinneck',
    'cdlinvertedhammer',
    'cdlkicking',
    'cdlkickingbylength',
    'cdlladderbottom',
    'cdllongleggeddoji',
    'cdllongline',
    'cdlmarubozu',
    'cdlmatchinglow',
    'cdlmathold',
    'cdlmorningdojistar',
    'cdlmorningstar',
    'cdlonneck',
    'cdlpiercing',
    'cdlrickshawman',
    'cdlrisefall3methods',
    'cdlseparatinglines',
    'cdlshootingstar',
    'cdlshortline',
    'cdlspinningtop',
    'cdlstalledpattern',
    'cdlsticksandwich',
    'cdltakuri',
    'cdltasukigap',
    'cdlthrusting',
    'cdltristar',
    'cdlunique3river',
    'cdlupsidegap2crows',
    'cdlxsidegap3methods'
  ];
  const chartIndicators = [
    ...userIndicators,
    'ad',
    'adosc',
    'adx',
    'adxr',
    'ao',
    'apo',
    'aroon',
    'aroonosc',
    'atr',
    'bop',
    'cci',
    'cmo',
    'cvi',
    'di',
    'dm',
    'dpo',
    'dx',
    'emv',
    'fisher',
    'fosc',
    'kvo',
    'linregintercept',
    'linregslope',
    'macd',
    'macdext',
    'macdfix',
    'marketfi',
    'mass',
    'mfi',
    'minus_di',
    'minus_dm',
    'mom',
    'msw',
    'natr',
    'nvi',
    'obv',
    'plus_di',
    'plus_dm',
    'ppo',
    'pvi',
    'qstick',
    'roc',
    'rocp',
    'rocr',
    'rocr100',
    'rsi',
    'sar',
    'sarext',
    'stoch',
    'stochf',
    'stochrsi',
    'tr',
    'trange',
    'trix',
    'ultosc',
    'uo',
    'vhf',
    'volatility',
    'vosc',
    'wad',
    'willr'
  ];

  export default {
    name: "VueEchartWrapper",
    props: ["candles", "trades", "indicators"],
    mounted: function () {
      this.extendDimensions();
      this.preparedOptions = this.updateCandles();
    },
    components: {
      'chart': ECharts
    },
    computed: {
      dynOptions: function () {
        return this.preparedOptions;
      }
    },
    data() {
      return {
        dynHeight: 300,
        marketLineThreshold: 500,
        selectedIndicator: null,
        indicatorChartGroups: [],
        preparedOptions: null,
        dimensions: [
          {name: "low", type: "number", displayName: "Low"},
          {name: "high", type: "number", displayName: "High"},
          {name: "open", type: "number", displayName: "Open"},
          {name: "close", type: "number", displayName: "Close"},
          {name: "volume", type: "number", displayName: "Volume"},
          {name: "start", displayName: "Start"}
        ],
        upColor: "#ec0000",
        //upBorderColor: "#8A0000",
        downColor: "#00da3c",
        // downBorderColor: "#008F28"
      };
    },
    methods: {
      setGroups() {
        this.indicatorChartGroups = _.filter(Object.keys(_.groupBy(this.dimensions, 'group')), function (i) {
          return i !== 'undefined'
        });
      },
      extendDimensions() {
        let ctx = this;
        let cnt = 0;
        // EXTEND DIMENSIONS WITH INDICATORS
        if (!_.isEmpty(this.indicators)) {
          _.each(Object.keys(ctx.indicators), function (item) {
            let ind = ctx.indicators[item];
            _.each(ind.indicators, function (indicatorResult, key) {
              if (!_.isEmpty(indicatorResult) || (!_.isNull(indicatorResult) && !_.isUndefined(indicatorResult))) {
                if (_.isObject(indicatorResult)) {
                  let k = Object.keys(indicatorResult);
                  _.each(k, function (it) {
                    let o = {};
                    if (!(it === 'result')) {
                      o['name'] = key + '_' + it;
                      o['group'] = key;
                      o['type'] = 'number';
                      o['displayName'] = key;
                    } else {
                      o['name'] = it;
                      o['group'] = it;
                      o['type'] = 'number';
                      o['displayName'] = key;
                    }

                    o['displayType'] = ctx.checkForDisplayType(it);

                    if (!_.find(ctx.dimensions, {name: o.name}))
                      ctx.dimensions.push(o);
                  })
                } else {
                  let o = {};
                  o['name'] = key;
                  o['group'] = key;
                  o['type'] = "number";
                  o['displayName'] = key;

                  o['displayType'] = ctx.checkForDisplayType(key);

                  if (!_.find(ctx.dimensions, {name: o.name}))
                    ctx.dimensions.push(o);
                }
              }
            });

            cnt++;

          });
        }
        // setup each Indicator (grouped) as one chart based on returned data from the backtest
        this.setGroups();
      },
      extendCandlesWithIndicatorValues() {
        let ctx = this;
        let dim = this.dimensions.map(d => d.name);
        if (this.candles[0]) {
          let cDim = Object.keys(this.candles[0]);
          let diff = _.difference(dim, cDim);

          // patch candles with dimension
          if (!_.isEmpty(this.indicators)) {
            _.each(ctx.candles, function (candle, index) { // indicator-array
              let indicator = ctx.indicators[index].indicators;
              _.each(indicator, function (value, key) { // loop indicators-object key-value pairs
                if (_.isObject(value)) { // check if it's an object
                  _.each(value, function (subValue, subKey) { // if so, loop all values
                    candle[`${key}_${subKey}`] = subValue; // build correct key
                  })
                } else { // else just patch candle value
                  candle[key] = value;
                }
              });
              // patch remaining properties of candle
              _.each(diff, function (value, idx) {
                if (!candle[value]) candle[value] = null;
              });
            });
          }
        }
      },
      checkForDisplayType: function (resultName) {
        if (resultName) {
          if (chartIndicators.indexOf(resultName) >= 0) return 'indicator';
          if (chartOverlays.indexOf(resultName) >= 0) return 'overlay';
          if (chartPatterns.indexOf(resultName) >= 0) return 'pattern';
        }
        // defaults to overlay
        return 'overlay';
      },
      updateCandles: function () {
        // put all values into one array...
        this.extendCandlesWithIndicatorValues();

        let options = {
          title: {
            left: 'center',
            text: "Market including trades"
          },
          renderer: 'svg',
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross"
            }
          },
          xAxis: [],
          yAxis: [],
          dataZoom: [
            {
              id: "dataZoomX",
              type: "slider",
              xAxisIndex: [0],
              filterMode: "filter"
            },
            /*{
              id: "dataZoomY",
              type: "slider",
              yAxisIndex: [0],
              filterMode: "empty"
            }*/
          ]
        };

        const tradeMarkings = [];
        let lowest = Number.POSITIVE_INFINITY;
        let highest = Number.NEGATIVE_INFINITY;
        let tmpLow, tmpHigh;
        for (let i = this.candles.length - 1; i >= 0; i--) {
          tmpLow = this.candles[i].low;
          tmpHigh = this.candles[i].low;
          if (tmpLow < lowest) lowest = tmpLow;
          if (tmpHigh > highest) highest = tmpHigh;
        }

        options.dataset = {};
        options.dataset.source = this.candles;

        //options.dataZoom[1].startValue = lowest;
        //options.dataZoom[1].endValue = highest;

        options.dataZoom[0].start = 80;
        options.dataZoom[0].end = 100;

        options.legend = {
          top: 30,
          data: ["Market", "Volume"]
        };

        options.series = [];
        // if the backtester yielded more than X candles switch to line instead of candlesticks
        if (this.candles.length > this.marketLineThreshold) {
          options.series.push(
            {
              name: 'Market',
              type: "line",
              encode: {
                x: "start",
                y: ["close"],
                tooltip: ["open", "close", "high", "low"]
              },
              showSymbol: false,
              itemStyle: {
                normal: {
                  color: '#000',
                  lineStyle: {
                    type: 'solid',
                    width: '1'
                  }
                },
              },
              xAxisIndex: 0,
              yAxisIndex: 0
            }
          );
        } else {
          options.series.push(
            {
              name: 'Market',
              type: "candlestick",
              encode: {
                x: "start",
                y: ["open", "close", "high", "low"],
                tooltip: ["open", "close", "high", "low"]
              },
              itemStyle: {
                normal: {
                  color: this.upColor,
                  color0: this.downColor,
                  borderColor: this.upBorderColor,
                  borderColor0: this.downBorderColor
                }
              },
              xAxisIndex: 0,
              yAxisIndex: 0
            }
          );
        }

        options.series.push(
          {
            name: "Volume",
            type: "bar",
            encode: {
              x: "start",
              y: "volume"
            },
            showSymbol: false,
            itemStyle: {
              normal: {
                color: "#aa4845",
                opacity: 0.2
              }
            },
            xAxisIndex: 0,
            yAxisIndex: 1
          }
        );

        options.xAxis.push({type: "time"});
        options.yAxis.push({scale: true});
        options.yAxis.push({scale: true, show: false});

        options.dimensions = this.dimensions;

        // TRADES DISPLAY
        if (this.trades && this.trades.length) {
          let self = this;
          _.each(this.trades, function (item) {
            let tmp = {
              coord: [item.date, item.price],
              name: item.action,
              label: {
                position: item.action === "sell" ? "top" : "bottom",
                distance: 15
              },
              value: item.action + "\n" + item.price,
              symbolSize: [15, 30],
              symbol: "arrow",
              symbolRotate: item.action === "sell" ? 180 : 0,
              //symbolOffset: item.action === 'sell' ? [0, -5] : [0, 5],
              itemStyle: {
                color: item.action === "sell" ? self.upColor : self.downColor
              }
            };
            tradeMarkings.push(tmp);
          });
          options.series[0]["markPoint"] = {
            data: tradeMarkings
          };
        }

        // CREATE LINE FOR EACH INDICATOR AND DETERMINE AXIS FOR DISPLAY
        let group = _.groupBy(options.dimensions, 'group');
        options.yAxis.push({scale: false}); // create a third yAxis // Grid Index 1 left
        options.yAxis.push({scale: true}); // create a fourth yAxis // Grid Index 1 right
        options.yAxis.push({scale: true}); // create a fifth yAxis // Grid Index 2 left
        let lastyAxisIndicator = 'left';
        _.each(Object.keys(group), function (item) {
          if (item !== 'undefined') {
            _.each(group[item], function (sItem) {
              if (sItem !== undefined) {
                let yAxisIndex = 2;
                let xAxisIndex = 0;
                if (sItem.displayType) {
                  if (sItem.displayType === 'overlay') {
                    yAxisIndex = 0;
                  }
                  else if (sItem.displayType === 'indicator') {
                    // push to grid axis
                    if (options.xAxis.length < 3) {
                      options.xAxis.push({type: "time"});
                    }
                    xAxisIndex = 1;
                    yAxisIndex = lastyAxisIndicator === 'left' ? 2 : 3;
                    if (lastyAxisIndicator === 'left') {
                      lastyAxisIndicator = 'right';
                    }
                    else lastyAxisIndicator = 'left';
                  }
                  else if (sItem.displayType === 'pattern') {
                    if (options.xAxis.length < 3) {
                      options.xAxis.push({type: "time"});
                    }
                    xAxisIndex = 2;
                    yAxisIndex = 4;
                  }
                }
                // don't display if the indicator is a pattern-recognition
                if (yAxisIndex !== null) {
                  let seriesObj = {
                    type: "line",
                    encode: {
                      x: "start",
                      y: sItem.name
                    },
                    xAxisIndex: xAxisIndex,
                    yAxisIndex: yAxisIndex,
                    name: sItem.name,
                    showSymbol: false
                  };
                  options.legend.data.push(sItem.name)
                  options.series.push(seriesObj);
                }
              }
            });
          }
        });
        // now correct xAxis assignments if necessary (because we couldn't determine it in the above loop :(
        let axisLength = options.xAxis.length;
        _.each(options.series, function (s) {
          if (s.xAxisIndex && s.xAxisIndex > (axisLength - 1)) {
            s.xAxisIndex = axisLength - 1;
            s.yAxisIndex = s.yAxisIndex - 1;
          }
        });

        // Create Grid and assign axes stuff....
        switch (options.xAxis.length) {
          case 2:
            this.dynStyle = 'twoAxis';
            this.dynHeight = 500;
            break;
          case 3:
            this.dynStyle = 'threeAxis';
            this.dynHeight = 600;
            break;
          default:
            this.dynStyle = 'oneAxis';
            this.dynHeight = 300;
            break;
        }

        // Grid Settings:
        // yAxis 0+1, xAxis 0 => Index: 0
        // yAxis 2+3, xAxis 1 => Index: 1
        // yAxis 4, xAxis 2 => Index: 2
        if (axisLength > 1) {
          // Define a Grid!
          let preGrid = [{
            left: 20,
            right: 20,
            top: 110,
            height: 220
          }, {
            left: 20,
            right: 20,
            height: 80,
            top: 360
          }, {
            left: 20,
            right: 20,
            height: 40,
            top: 470
          }];

          options.grid = [];
          for (let i = 0; i <= axisLength - 1; i++) {
            options.grid.push(preGrid[i]);
          }
          switch (options.grid.length) {
            case 2:
              options.xAxis[1]['gridIndex'] = 1;
              options.yAxis[2]['gridIndex'] = 1;
              options.yAxis[3]['gridIndex'] = 1;
              options.dataZoom[0].xAxisIndex = [0, 1]
              options.yAxis.splice(4, 1);
              break;
            case 3:
              options.xAxis[1]['gridIndex'] = 1;
              options.yAxis[2]['gridIndex'] = 1;
              options.yAxis[3]['gridIndex'] = 1;
              options.xAxis[2]['gridIndex'] = 2;
              options.yAxis[4]['gridIndex'] = 2;
              options.dataZoom[0].xAxisIndex = [0, 1, 2]
              break;
          }
        }
        // dirty workaround fix :(
        if(this.$refs.chart && this.$refs.chart.$el && this.$refs.chart.$el.style) {
          this.$refs.chart.$el.style.height = this.dynHeight + "px";
          //this.$refs.chart.$el.style.width = "100%";
        }

        return options;
      }
    },
    watch: {
      candles: function () {
        this.preparedOptions = this.updateCandles();
      },
      trades: function () {
        this.preparedOptions = this.updateCandles();
      },
      selectedIndicator: function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.displaySide = 2;
          this.preparedOptions = this.updateCandles();
        }
      },
      displaySide: function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.preparedOptions = this.updateCandles();
        }
      }
    }
  };
</script>
