<template>
  <div>
    <h3>Indicator Charts</h3>
    <!-- charts will be added by the method createCharts -->
  </div>
</template>

<script>
  import echarts from 'echarts/dist/echarts-en.min'
  import _ from 'lodash'

  export default {
    name: "IndicatorChart",
    props: ['candles', 'trades', 'indicators'],
    data: function () {
      return {
        indicatorChartRefs: [],
        indicatorChartGroups: [],
        indicatorChartOptions: {
          title: {
            text: "Indicators"
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross"
            }
          },
          xAxis: {type: "time"},
          yAxis: [],
          dataZoom: [
            {
              id: "dataZoomX",
              type: "slider",
              xAxisIndex: [0],
              filterMode: "filter"
            },
            {
              id: "dataZoomY",
              type: "slider",
              yAxisIndex: [0],
              filterMode: "empty"
            }
          ]
        },
      }
    },
    mounted: function () {
      this.createCharts();
    },
    methods: {
      setGroups() {
        this.indicatorChartGroups = _.filter(Object.keys(_.groupBy(this.indicatorChartOptions.dimensions, 'group')), function (i) {
          return i !== 'undefined'
        });
      },
      fixCandles() {
        // fix candles so that all candles have at least the required properties
        // get this info from last candle - there should be all values inside...
        let vToCheck = Object.keys(this.candles[this.candles.length - 1]);
        this.candles.forEach(function (candle) {
          vToCheck.forEach(function (p) {
            if (!_.has(candle, p)) _.set(candle, p, null);
          })
        })
      },
      createCharts: function () {
        let ctx = this;

        // setup datasource
        this.indicatorChartOptions.dataset = {};
        this.indicatorChartOptions.dataset.source = this.candles;

        // setup base dimensions for candles
        this.indicatorChartOptions.dimensions = [
          {name: "low", type: "number", displayName: "Low"},
          {name: "high", type: "number", displayName: "High"},
          {name: "open", type: "number", displayName: "Open"},
          {name: "close", type: "number", displayName: "Close"},
          {name: "start", displayName: "Start"}
        ];

        // Add Dimensions from indicatorResults and extend candles with dimensional values
        if (!_.isEmpty(this.indicators)) {
          _.each(Object.keys(ctx.indicators), function (item) {
            let ind = ctx.indicators[item];

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
                    ctx.candles[idx][o.name] = indicatorResult.result[it];

                    if (!_.find(ctx.indicatorChartOptions.dimensions, {name: o.name}))
                      ctx.indicatorChartOptions.dimensions.push(o);
                  })
                } else {
                  let o = {};
                  o['name'] = item;
                  o['group'] = indicatorResult.indicator === null ? item : indicatorResult.indicator;
                  o['type'] = "number";
                  o['displayName'] = item + ' (native)';

                  // add result value to candle-array
                  ctx.candles[idx][o.name] = indicatorResult.result;

                  if (!_.find(ctx.indicatorChartOptions.dimensions, {name: o.name}))
                    ctx.indicatorChartOptions.dimensions.push(o);
                }
              }
            });
          });
        }

        // setup each Indicator (grouped) as one chart based on returned data from the backtest
        this.fixCandles();
        this.setGroups();

        // setup series and axes
        this.indicatorChartOptions.series = []

        // render a new axis for each group
        let groups = _.groupBy(this.indicatorChartOptions.dimensions, 'group');
        let idx = 0; // second axis for series as start - first axis ist candlesticks
        _.each(Object.keys(groups), function (groupItem) {
          if (groupItem !== "undefined") {
            // create an instance for every group
            let instanceProps = _.cloneDeep(ctx.indicatorChartOptions);
            instanceProps.legend = {
              data: []
            };
            // create an axis for every group item
            let yAxisObject = {
              scale: true,
              name: groupItem,
              show: true
            };
            // this one contains all grouped indicators that we want to display at once in the chart
            // loop through itemnames and create a series
            _.each(groups[groupItem], function (sItem) {
              let seriesObj = {
                type: "line",
                encode: {
                  x: "start",
                  y: sItem.name
                },
                name: sItem.name,
                showSymbol: false
              };
              instanceProps.series.push(seriesObj);
              instanceProps.legend.data.push(sItem.name);
            });
            // always add price
            let yAxisObjectPrice = {
              scale: true,
              name: "price",
              show: false
            };
            /*let seriesObj = {
              type: "line",
              encode: {
                x: "start",
                y: "close"
              },
              name: "price",
              yAxisIndex: 1,
              showSymbol: false,
              itemStyle: {
                color: "#617e95"
              },
              lineStyle: {
                type: 'dashed'
              }
            };*/

            let seriesObj = {
              name: 'Market',
              type: "candlestick",
              encode: {
                x: "start",
                y: ["open", "close", "high", "low"],
                tooltip: ["open", "close", "high", "low"]
              },
              yAxisIndex: 1
            };

            instanceProps.series.push(seriesObj);
            instanceProps.legend.data.push("Market")

            instanceProps.yAxis.push(yAxisObject);
            instanceProps.yAxis.push(yAxisObjectPrice);

            instanceProps.dataZoom[1].yAxisIndex.push(idx);
            idx++;

            instanceProps.title.text = "Indicator chart " + groupItem;
            // create Chart for this group of indicators
            let e = document.createElement('div');
            e.setAttribute('ref', 'indicator_' + groupItem);
            e.setAttribute('style', 'height:320px');
            ctx.$el.appendChild(e);

            let chartRef = echarts.init(e, null, {renderer: 'svg'});
            chartRef.setOption(instanceProps, true);
            ctx.indicatorChartRefs.push(chartRef);
          }
        });
      },
      disposeCharts: function () {
        this.indicatorChartRefs.forEach(function (ref) {
          ref.dispose();
          ref = null;
        });
      }
    },
    watch: {
      candles: function (newVal, oldVal) {
        this.disposeCharts();
        this.createCharts();
      },
      trades: function (newVal, oldVal) {
        this.createCharts();
      }
    },
    beforeDestroy: function () {
      const that = this;
      that.disposeCharts();
    }
  }
</script>

<style scoped>

</style>
