<template>
  <div>
    <h3>Market graph</h3>
    <div class="row justify-center q-ma-sm">
      <q-radio v-model="selectedIndicator" :val="null" label="Market only"/>
      <q-radio class="q-ml-md" v-for="g in indicatorChartGroups" v-model="selectedIndicator" :val="g"
               :label="g.toUpperCase()" :key="g"/>
    </div>
    <div class="row justify-center q-mb-lg" v-if="selectedIndicator">
      <b>Display on</b>
      <q-radio v-model="displaySide" :val="0" label="left"/>
      <q-radio v-model="displaySide" :val="2" label="right"/>
    </div>

    <chart :options="dynOptions" auto-resize ref="chart" class="full-width"></chart>
  </div>
</template>

<script>
  import _ from "lodash";
  import ECharts from 'vue-echarts'

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
        selectedIndicator: null,
        indicatorChartGroups: [],
        preparedOptions: null,
        displaySide: 2, // can be 0 (for price axis) or 2 (for e.g. RSI)
        dimensions: [
          {name: "low", type: "number", displayName: "Low"},
          {name: "high", type: "number", displayName: "High"},
          {name: "open", type: "number", displayName: "Open"},
          {name: "close", type: "number", displayName: "Close"},
          {name: "volume", type: "number", displayName: "Volume"},
          {name: "start", displayName: "Start"}
        ],
        upColor: "#ec0000",
        upBorderColor: "#8A0000",
        downColor: "#00da3c",
        downBorderColor: "#008F28"
      };
    },
    methods: {
      setSelectedIndicator(indicator) {
        this.selectedIndicator = indicator;
        this.preparedOptions = this.updateCandles();
      },
      setGroups() {
        this.indicatorChartGroups = _.filter(Object.keys(_.groupBy(this.dimensions, 'group')), function (i) {
          return i !== 'undefined'
        });
      },
      extendDimensions() {
        let ctx = this;
        // EXTEND DIMENSIONS WITH INDICATORS
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

                    if (!_.find(ctx.dimensions, {name: o.name}))
                      ctx.dimensions.push(o);
                  })
                } else {
                  let o = {};
                  o['name'] = item;
                  o['group'] = indicatorResult.indicator === null ? item : indicatorResult.indicator;
                  o['type'] = "number";
                  o['displayName'] = item + ' (native)';

                  if (!_.find(ctx.dimensions, {name: o.name}))
                    ctx.dimensions.push(o);
                }
              }
            });
          });
        }
        // setup each Indicator (grouped) as one chart based on returned data from the backtest
        this.setGroups();
      },
      updateCandles: function () {
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

        options.series = [
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
          },
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
        ];

        options.xAxis.push({type: "time"});
        options.yAxis.push({scale: true});
        options.yAxis.push({scale: true, show: false});

        options.dimensions = this.dimensions;

        // TRADES DISPLAY
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
          options.series[0]["markPoint"] = {
            data: tradeMarkings
          };
        }
        let ctx = this;
        if (this.selectedIndicator) {
          // CREATE A NEW SERIES FOR THE SELECTED INDICATOR
          let group = _.groupBy(_.filter(options.dimensions, function (o) {
            return o.group === ctx.selectedIndicator
          }), 'group');
          options.yAxis.push({scale: true});
          _.each(group[ctx.selectedIndicator], function (sItem) {
            let seriesObj = {
              type: "line",
              encode: {
                x: "start",
                y: sItem.name
              },
              xAxisIndex: 0,
              yAxisIndex: ctx.displaySide,
              name: sItem.name,
              showSymbol: false
            };
            options.legend.data.push(sItem.name)
            options.series.push(seriesObj);
          });
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
