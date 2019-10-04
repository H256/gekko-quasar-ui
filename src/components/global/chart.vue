<template>
   <chart :options="dynOptions" v-if="candles.length" auto-resize ref="chart" class="full-width"></chart>
</template>

<script>
  import _ from "lodash";
  // import individual components to save build size...
  import 'echarts/lib/chart/line'
  import 'echarts/lib/chart/bar'
  import 'echarts/lib/chart/candlestick'
  import 'echarts/lib/component/tooltip'
  import 'echarts/lib/component/dataZoom'
  import 'echarts/lib/component/legend'
  import 'echarts/lib/component/axis'
  import 'echarts/lib/component/axisPointer'
  import 'echarts/lib/component/title'
  import 'echarts/lib/component/dataset'
  import 'echarts/lib/component/markPoint'
  import 'echarts/lib/component/markLine'

  import ECharts from 'vue-echarts'
  import moment from 'moment';

  const userIndicators = (window.CONFIG.userChartConfig && window.CONFIG.userChartConfig.indicators) || [];
  const userPatterns = (window.CONFIG.userChartConfig && window.CONFIG.userChartConfig.patterns) || [];
  const userOverlays = (window.CONFIG.userChartConfig && window.CONFIG.userChartConfig.overlays) || [];

  let patternsArray = [];

  const chartOverlays = [
    ...userOverlays,
    'ovr',
    'avgprice',
    'bbands',
    'dema',
    'ema',
    'hma',
    'ht_trendline',
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
    'zlema',
    'short',
    'medium',
    'long'
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
    'ind',
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
    'ht_dcperiod',
    'ht_dcphase',
    'ht_phasor',
    'ht_sine',
    'ht_trendmode',
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
          {name: "start", type: "category", displayName: "Start"}
        ],
        upColor: "#00da3c",
        downColor: "#ec0000",
      };
    },
    methods: {

      extendDimensions() {

          let ctx = this;

          // EXTEND DIMENSIONS WITH INDICATORS
          if (!_.isEmpty(this.indicators)) {
              //the key is just a number which represents the the location in the array
              //each location in the array contains all the indicators for each time step as an Object
              _.each(Object.keys(ctx.indicators), function(arrayIndexNumber) {
                  //ind is the Object at a particular timestep
                  //it contains all the indicators for that timestep
                  let ind = ctx.indicators[arrayIndexNumber];
                  //For each extracted timestep iterate over each indicator within that timestep
                  //indicatorResult is either an object containing more than one indicator (like + and - lines for example)
                  //or a number in the case where the indicator which only has one line to plot
                  //indicatorName is Example: this.addTalibIndicator('smaFast', 'sma', params);
                  //smaFast is the indicatorName
                  _.each(ind.indicators, function(indicatorResult, indicatorName) {

                      //the indicator name i.e. the first element in the brackets of the following in the strategy:
                      //this.addTalibIndicator('sma_Fast', 'sma', smaFastParams);
                      //should always have the indicator type as detailed in the second element in the brackets
                      //If you wish to have more than one of that type of indicator (for example mulitple sma indicators)
                      //then you will have to specify a unique name. This should always be in this format (i.e using a hyphen separator):
                      //indicatorname-uniquename
                      //the code below splits the above to ensure the indicator name is consistent with the lists of indicator names used to 
                      //plot the indicator in the right place on the charts

                      //this is an array with the split of the string occuring at a double underscore
                      let indicatorSplit = indicatorName.split(/\_(?=\_)/);
                      //this is the part before a double underscore
                      let indicatorFirstPart = indicatorName.split(/\_(?=\_)/)[0];

                      let displayType = ctx.checkForDisplayType(indicatorFirstPart);

                      //Special grouping / assignments
                      let fixedGroup = false;
                      let groupNumber = 1;

                      switch (indicatorFirstPart) {
                          case "topleft":
                              indicatorFirstPart = "ind";
                              fixedGroup = true;
                              groupNumber = 1;
                              break;
                          case "topright":
                              indicatorFirstPart = "ind";
                              fixedGroup = true;
                              groupNumber = 2;
                              break;
                          case "midleft":
                              indicatorFirstPart = "ind";
                              fixedGroup = true;
                              groupNumber = 3;
                              break;
                          case "midright":
                              indicatorFirstPart = "ind";
                              fixedGroup = true;
                              groupNumber = 4;
                              break;
                          case "botleft":
                              indicatorFirstPart = "ind";
                              fixedGroup = true;
                              groupNumber = 5;
                              break;
                          case "botright":
                              indicatorFirstPart = "ind";
                              fixedGroup = true;
                              groupNumber = 6;
                              break;
                          default:
                              break;
                      }




                      if (!_.isEmpty(indicatorResult) || (!_.isNull(indicatorResult) && !_.isUndefined(indicatorResult))) {

                          //Check if the indicator is an object
                          //This will happen when the indicator returns more than one set of data
                          //for example a line for plus and a line for minus
                          if (_.isObject(indicatorResult)) {

                              //the indicatorName is the first parameter in the brackets of the indicator when added in the strategy
                              //e.g. this.addTalibIndicator('sma__Fast', 'sma', smaFastParams);
                              //in the above case "indicatorName" would be "sma__Fast"
                              //
                              //the "subName" value is the different parts of the object returned for each "indicatorName"
                              //for example ht_sine produces:
                              //indicatorName: ht_sine subName: outSine
                              //and 
                              //indicatorName: ht_sine subName: outLeadSine
                              _.each(indicatorResult, function(result, subName) {

                                  let name = indicatorName + '_' + subName;
                                  let dimensionsArray = ctx.dimensions;
                                  ctx.createIndicator(result, name, displayType, fixedGroup, groupNumber, dimensionsArray);

                              });

                              //otherwise there is just one return value and hence it is not an object
                          } else {

                              let name = indicatorName;
                              let dimensionsArray = ctx.dimensions;
                              ctx.createIndicator(indicatorResult, name, displayType, fixedGroup, groupNumber, dimensionsArray);

                          }
                      }


                  });
              });
          }
      },

      createIndicator: function(result, name, displayType, fixedGroup, groupNumber, dimensionsArray) {

          let o = {};
          o['displayType'] = displayType;
          o['name'] = name;
          o['type'] = 'number';
          if (fixedGroup) {
              o['group_fixed'] = true;
              o['group'] = groupNumber;
          } else {
              o['group_fixed'] = false;
              o['group'] = 1;
          }
          o['max'] = result;
          o['min'] = result;

          //if it already exists in the dimensions array don't add it
          //otherwise add it

          let objectIndex = _.findIndex(dimensionsArray, {
              name: o.name
          });

          //if it already exists in the dimensions array don't add it
          //otherwise add it (-1 index means it doesn't exist)
          if (objectIndex === -1) {

              dimensionsArray.push(o);

          } else {

              //if it already exists update the min and max values if required

              let indic = dimensionsArray[objectIndex];
              if (indic.max < o.max) {

                  dimensionsArray[objectIndex].max = o.max;

              } else if (indic.min < o.min) {

                  dimensionsArray[objectIndex].min = o.min;

              }

              //set the group based on the max and min values

              if (o.displayType === 'indicator' && !fixedGroup) {

                  indic = dimensionsArray[objectIndex];
                  let max = indic.max;
                  let min = indic.min;
                  let currentGroup = indic.group;


                  if (max > 10000 || min < -10000) {
                      dimensionsArray[objectIndex].group = 6;
                  } else if (((max > 1000 && max <= 10000) || (min < -1000 && min >= -10000)) && currentGroup < 5) {
                      dimensionsArray[objectIndex].group = 5;
                  } else if (((max > 100 && max <= 1000) || (min < -100 && min >= -1000)) && currentGroup < 4) {
                      dimensionsArray[objectIndex].group = 4;
                  } else if (((max > 50 && max <= 100) || (min < -50 && min >= -100)) && currentGroup < 3) {
                      dimensionsArray[objectIndex].group = 3;
                  } else if (((max > 1 && max <= 50) || (min < -1 && min >= -50)) && currentGroup < 2) {
                      dimensionsArray[objectIndex].group = 2;
                  }

              }

          }

      },



      extendCandlesWithIndicatorValues() {
          let ctx = this;
          //this is list of all the names of the:
          // candles (low,high,open,close,volume,start) and
          // indicators, overlays and patterns (sma, obv, shootingstar etc.)
          let dim = this.dimensions.map(d => d.name);

          if (this.candles[0]) {
              //this is just the candles (low,high,open,close,volume,start)
              let cDim = Object.keys(this.candles[0]);
              //this is just the indicators, overlays and patterns
              let diff = _.difference(dim, cDim);

              //set an array that conatains only the names of the patterns that will be plotted
              let patterns = [];
              let counter = 0;
              _.each(diff, function(data, index) {
                  let firstPart = data.split(/\_/)[0];
                  if (chartPatterns.indexOf(firstPart) >= 0) {
                      patterns[counter] = data;
                      counter++;
                  }
              });

              // patch candles with dimension
              if (!_.isEmpty(this.indicators)) {
                  //loop through the candles array
                  _.each(ctx.candles, function(candle, index) {
                      //extract from the indicator array the data at the same timestep
                      let indicator = ctx.indicators[index].indicators;

                      //loop through the indicator values at that timestep
                      _.each(indicator, function(value, key) {
                          //check if it's an object (it will be an object if the indicator plots more than one line)
                          //for example plus and minus oscillators that use crossing as a signal to buy or sell
                          if (_.isObject(value)) {

                              _.each(value, function(subValue, subKey) {
                                  //add the indicator to the candle array
                                  candle[`${key}_${subKey}`] = subValue; // build correct key

                              })

                          } else {

                              //add the indicator to the candle array
                              candle[key] = value;

                          }

                      });
                      //if a value is not returned for a particular time step then set it to null
                      //this ensures a value is not presented
                      //for example a lot of the time the patterns don't return a value as the pattern 
                      //doesn't exist for that timestep. Setting null ensures nothing is plotted
                      _.each(diff, function(indicatorName, index) {

                          if (!candle[indicatorName]) candle[indicatorName] = null;

                      });

                      _.each(patterns, function(patternName, index) {

                          if (candle[patternName] != null) {

                              let nameSlice = patternName.slice(3);
                              let finalName = nameSlice.split(/\_/)[0];

                              //change the value of the pattern value in the candle array to the 'high' from the candle
                              candle[patternName] = candle['high'];

                              //add pattern value to pattern array
                              let pattern = {};
                              pattern['name'] = finalName;
                              pattern['value'] = candle['high'];
                              pattern['date'] = moment(candle['start']).format('YYYY-MM-DD HH:mm:ss');
                              patternsArray.push(pattern);

                          }



                      });
                  });
              }
          }
      },



      checkForDisplayType: function(resultName) {
          if (resultName) {
              if (chartIndicators.indexOf(resultName) >= 0) return 'indicator';
              if (chartOverlays.indexOf(resultName) >= 0) return 'overlay';
              if (chartPatterns.indexOf(resultName) >= 0) return 'pattern';
          }
          // defaults to indicator
          return 'indicator';
      },


      updateCandles: function() {
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
              axisPointer: {
                  link: {
                      xAxisIndex: 'all'
                  }
              },
              xAxis: [],
              yAxis: [],
              dataZoom: [{
                  id: "dataZoomX",
                  type: "slider",
                  xAxisIndex: [0],
                  filterMode: "filter"
              }, ]
          };

          const markers = [];
          let lowest = Number.POSITIVE_INFINITY;
          let highest = Number.NEGATIVE_INFINITY;
          let tmpLow, tmpHigh;
          for (let i = this.candles.length - 1; i >= 0; i--) {
              this.candles[i].start = moment(this.candles[i].start).format('YYYY-MM-DD HH:mm:ss')
              tmpLow = this.candles[i].low;
              tmpHigh = this.candles[i].low;
              if (tmpLow < lowest) lowest = tmpLow;
              if (tmpHigh > highest) highest = tmpHigh;
          }

          options.dataset = {};
          options.dataset.source = this.candles;

          options.dataZoom[0].start = 80;
          options.dataZoom[0].end = 100;

          options.legend = {
              top: 30,
              data: ["Market", "Volume"]
          };

          options.series = [];
          options.series.push({
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
          });

          options.series.push({
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
          });

          options.xAxis.push({
              type: 'category'
          });
          options.yAxis.push({
              scale: true
          });
          options.yAxis.push({
              scale: true,
              show: false
          });

          options.dimensions = this.dimensions;

          // TRADES DISPLAY
          let ctx = this;
          if (this.trades && this.trades.length) {
              _.each(this.trades, function(trade) {
                  const formattedDate = moment(trade.date).format('YYYY-MM-DD HH:mm:00')
                  let tradeMarker = {
                      coord: [formattedDate, trade.price],
                      name: trade.action,
                      label: {
                          position: trade.action === "sell" ? "top" : "bottom",
                          distance: 15
                      },
                      value: trade.action + "\n" + trade.price,
                      symbolSize: [15, 30],
                      symbol: "arrow",
                      symbolRotate: trade.action === "sell" ? 180 : 0,
                      symbolOffset: trade.action === "sell" ? [0, '-60%'] : [0, '60%'],
                      itemStyle: {
                          color: trade.action === "sell" ? ctx.downColor : ctx.upColor
                      }
                  };
                  markers.push(tradeMarker);
              });
          }
          // PATTERNS DISPLAY
          if (patternsArray && patternsArray.length) {
              _.each(patternsArray, function(pattern) {
                  let patternMarker = {
                      coord: [pattern.date, pattern.value],
                      name: pattern.name,
                      label: {
                          position: "top",
                          distance: 15
                      },
                      value: pattern.name,
                      symbolSize: [15, 30],
                      symbol: "diamond",
                      symbolRotate: 180,
                      symbolOffset: [0, '-100%'],
                      itemStyle: {
                          color: '#039be5'
                      }
                  };
                  markers.push(patternMarker);
              });

          }

          if ((this.trades && this.trades.length) || (patternsArray && patternsArray.length)) {

              options.series[0]["markPoint"] = {
                  data: markers
              };

          }


          // CREATE LINE FOR EACH INDICATOR AND DETERMINE AXIS FOR DISPLAY

          options.yAxis.push({
              scale: true
          }); // create a third yAxis // Grid Index 1 left
          options.yAxis.push({
              scale: true
          }); // create a fourth yAxis // Grid Index 1 right
          options.yAxis.push({
              scale: true
          }); // create a fifth yAxis // Grid Index 2 left
          options.yAxis.push({
              scale: true
          }); // create a sixth yAxis // Grid Index 2 right
          options.yAxis.push({
              scale: true
          }); // create a seventh yAxis // Grid Index 3 left
          options.yAxis.push({
              scale: true
          }); // create a eighth yAxis // Grid Index 3 right

          // push date to x-axis for the four x-axis that exist (0,1,2,3)
          while (options.xAxis.length < 4) {
            options.xAxis.push({
              type: "category",
              axisLabel: {
                show: false
              }
            });
          }

          //group by 'group' as only indicators have a group
          let groupArray = _.groupBy(options.dimensions, 'group');

          _.each(Object.keys(groupArray), function(groupNumber) {

              //if the group returns as undefined we know it is a candle or marker
              //which we don't want
              if (groupNumber !== 'undefined') {

                  _.each(groupArray[groupNumber], function(indicator) {

                      if (indicator !== undefined) {

                          let yAxisIndex = 2;
                          let xAxisIndex = 0;

                          if (indicator.displayType) {

                              if (indicator.displayType === 'overlay') {

                                  yAxisIndex = 0;

                              } else if (indicator.displayType === 'indicator') {

                                  let group = indicator.group;

                                  //assign the lines based on the group
                                  //the groups are decided by absolute max and min values of each series

                                  if (group === 1) {
                                      xAxisIndex = 1;
                                      yAxisIndex = 2;
                                  } else if (group === 2) {
                                      xAxisIndex = 1;
                                      yAxisIndex = 3;
                                  } else if (group === 3) {
                                      xAxisIndex = 2;
                                      yAxisIndex = 4;
                                  } else if (group === 4) {
                                      xAxisIndex = 2;
                                      yAxisIndex = 5;
                                  } else if (group === 5) {
                                      xAxisIndex = 3;
                                      yAxisIndex = 6;
                                  } else if (group === 6) {
                                      xAxisIndex = 3;
                                      yAxisIndex = 7;
                                  } else {
                                      xAxisIndex = 3;
                                      yAxisIndex = 7;
                                  }

                              }
                          }

                          //we don't want to plot patterns as lines so skip them
                          if (indicator.displayType != 'pattern') {

                              let seriesObj = null;
                              // assign legend info and line to appropriate chart
                              if (yAxisIndex !== null) {
                                  seriesObj = {
                                      type: "line",
                                      encode: {
                                          x: "start",
                                          y: indicator.name
                                      },
                                      xAxisIndex: xAxisIndex,
                                      yAxisIndex: yAxisIndex,
                                      name: indicator.name,
                                      showSymbol: false
                                  };
                                  options.legend.data.push(indicator.name)
                                  options.series.push(seriesObj);
                              }
                          }

                      }
                  });
              }
          });

          let axisLength = options.xAxis.length;

          //set the height of the graph container
          this.dynHeight = 900;

          // Grid Settings:
          if (axisLength > 1) {

              // Define a grid
              let preGrid = [{
                  left: 60,
                  right: 60,
                  top: '10%',
                  height: '43%'
              }, {
                  left: 60,
                  right: 60,
                  top: '57%',
                  height: '11%'
              }, {
                  left: 60,
                  right: 60,
                  top: '70%',
                  height: '11%'
              }, {
                  left: 60,
                  right: 60,
                  top: '83%',
                  height: '11%'
              }];

              options.grid = [];
              for (let i = 0; i <= axisLength - 1; i++) {
                  options.grid.push(preGrid[i]);
              }
              options.xAxis[1]['gridIndex'] = 1;
              options.yAxis[2]['gridIndex'] = 1;
              options.yAxis[3]['gridIndex'] = 1;
              options.xAxis[2]['gridIndex'] = 2;
              options.yAxis[4]['gridIndex'] = 2;
              options.yAxis[5]['gridIndex'] = 2;
              options.xAxis[3]['gridIndex'] = 3;
              options.yAxis[6]['gridIndex'] = 3;
              options.yAxis[7]['gridIndex'] = 3;
              options.dataZoom[0].xAxisIndex = [0, 1, 2, 3]
          }
          // dirty workaround fix :(
          if (this.$refs.chart && this.$refs.chart.$el && this.$refs.chart.$el.style) {
              this.$refs.chart.$el.style.height = this.dynHeight + "px";
          }

          return options;
      }
      //end of update candles function
    },
    // end of methods

    watch: {
      candles: function () {
        this.preparedOptions = this.updateCandles();
      },
      trades: function () {
        this.preparedOptions = this.updateCandles();
      }
    }
    // end of watch

  };
  //end of export default

</script>