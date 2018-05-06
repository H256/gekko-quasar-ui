<template>
  <div>
    <h3>Market graph</h3>
    <div class="full-width" ref="chart" style="height:400px;"></div>
  </div>
</template>

<script>
  import Vue from "vue";
  import echarts from "echarts/dist/echarts-en";
  import _ from "lodash";

  export default {
    name: "EChartWrapper",
    props: ["candles", "trades", "indicators"],
    mounted: function () {
      this.chartRef = echarts.init(this.$refs.chart);
      this.updateCandles();
      this.renderIndicatorChart();
    },
    data() {
      return {
        chartRef: null,
        indicatorChartRefs: [],
        indicatorChartGroups: [],
        chartOptions: {
          title: {
            text: "Market including trades"
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross"
            }
          },
          xAxis: {type: "time"},
          yAxis: [
            {scale: true}
          ],
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
        upColor: "#ec0000",
        upBorderColor: "#8A0000",
        downColor: "#00da3c",
        downBorderColor: "#008F28"
      };
    },
    methods: {
      setGraphOptions: function () {
        this.chartRef.setOption(this.chartOptions, true);
      },
      updateCandles: function () {
        let ctx = this;
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

        this.chartOptions.dataset = {};
        this.chartOptions.dataset.source = this.candles;

        //this.chartOptions.dataZoom[1].startValue = lowest;
        //this.chartOptions.dataZoom[1].endValue = highest;

        //this.chartOptions.dataZoom[0].start = 80;
        //this.chartOptions.dataZoom[0].end = 100;

        this.chartOptions.legend = {
          data: ["Market", "Price"]
        };

        this.chartOptions.series = [
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
            }
          },
          {
            name: "Price",
            type: "line",
            encode: {
              x: "start",
              y: "close"
            },
            showSymbol: false,
            lineStyle: {
              type: 'dashed'
            }
          }
        ];

        this.chartOptions.dimensions = [
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

                    if (!_.find(ctx.chartOptions.dimensions, {name: o.name}))
                      ctx.chartOptions.dimensions.push(o);
                  })
                } else {
                  let o = {};
                  o['name'] = item;
                  o['group'] = indicatorResult.indicator === null ? item : indicatorResult.indicator;
                  o['type'] = "number";
                  o['displayName'] = item + ' (native)';

                  // add result value to candle-array
                  ctx.candles[idx][o.name] = indicatorResult.result;

                  if (!_.find(ctx.chartOptions.dimensions, {name: o.name}))
                    ctx.chartOptions.dimensions.push(o);
                }
              }
            });
          });
        }

        if (this.trades && this.trades.length) {
          let self = this;
          _.each(this.trades, function (item) {
            let tmp = {
              coord: [item.date.toString(), item.price],
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
          this.chartOptions.series[0]["markPoint"] = {
            data: tradeMarkings
          };
        }

        this.chartRef.setOption(this.chartOptions, true);
      },
      setGroups() {
        this.indicatorChartGroups = _.filter(Object.keys(_.groupBy(this.chartOptions.dimensions, 'group')), function (i) {
          return i !== 'undefined'
        });
      },
      renderIndicatorChart: function () {
        this.setGroups();
        // fix candles so that all candles have at least the required properties
        // get this info from last candle - there should be all values inside...
        let vToCheck = Object.keys(this.candles[this.candles.length - 1]);
        this.candles.forEach(function (candle) {
          vToCheck.forEach(function (p) {
            if (!_.has(candle, p)) _.set(candle, p, null);
          })
        })


        this.indicatorChartOptions.dataset = {};
        this.indicatorChartOptions.dataset.source = this.candles;
        this.indicatorChartOptions.series = []

        //this.indicatorChartOptions.dataZoom[0].start = 80;
        //this.indicatorChartOptions.dataZoom[0].end = 100;

        let ctx = this;

        // render a new axis for each group
        let groups = _.groupBy(this.chartOptions.dimensions, 'group');
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
            let seriesObj = {
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
            };
            instanceProps.series.push(seriesObj);
            instanceProps.legend.data.push("price")

            instanceProps.yAxis.push(yAxisObject);
            instanceProps.yAxis.push(yAxisObjectPrice);

            instanceProps.dataZoom[1].yAxisIndex.push(idx);
            idx++;

            instanceProps.title.text = "Indicator chart " + groupItem;
            // create Chart for this group of indicators
            let e = document.createElement('div');
            e.setAttribute('ref', 'indicator_' + groupItem);
            e.setAttribute('style', 'height:300px');
            ctx.$el.appendChild(e);
            let chartRef = echarts.init(e);
            chartRef.setOption(instanceProps, false);
            ctx.indicatorChartRefs.push(chartRef);
          }
        });
      },
      disposeCharts: function () {
        this.chartRef.dispose();
        this.indicatorChartRefs.forEach(function (ref) {
          ref.dispose();
          ref = null;
        })
        this.chartRef = null;
      }
    },
    watch: {
      candles: function (newVal, oldVal) {
        this.disposeCharts();
        this.chartRef = echarts.init(this.$refs.chart);
        this.updateCandles();
        this.renderIndicatorChart();
      },
      trades: function (newVal, oldVal) {
        this.updateCandles();
      }
    },
    beforeDestroy() {
      const that = this;
      that.chartRef && that.chartRef.dispose();
      that.indicatorChartRefs.forEach(function (ref) {
        ref.dispose();
        ref = null;
      })
      that.chartRef = null;
    }
  };
</script>
