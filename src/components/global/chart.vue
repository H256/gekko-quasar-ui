<template>
  <div>
    <h3>Market graph</h3>
    <div class="full-width" ref="chart" style="height:400px;"></div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import echarts from 'echarts/dist/echarts-en.min'
  import _ from 'lodash'

  export default {
    name: "EChartWrapper",
    props: ["candles", "trades"],
    mounted: function () {
      this.chartRef = echarts.init(this.$refs.chart);
      this.updateCandles();
    },
    data() {
      return {
        chartRef: null,
        chartOptions: {
          title: {
            text: 'Market including trades'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          xAxis: {type: 'time'},
          yAxis: {scale: true},
          dataZoom: [
            {
              id: 'dataZoomX',
              type: 'slider',
              xAxisIndex: [0],
              filterMode: 'filter',
            },
            {
              id: 'dataZoomY',
              type: 'slider',
              yAxisIndex: [0],
              filterMode: 'empty'
            }
          ],
        },
        upColor: '#ec0000',
        upBorderColor: '#8A0000',
        downColor: '#00da3c',
        downBorderColor: '#008F28',
      };
    },
    methods: {
      setGraphOptions: function () {
        this.chartRef.setOption(this.chartOptions, true);
      },
      updateCandles: function () {
        const tradeMarkings = []
        let lowest = Number.POSITIVE_INFINITY;
        let highest = Number.NEGATIVE_INFINITY;
        let tmpLow, tmpHigh;
        for (let i = this.candles.length - 1; i >= 0; i--) {
          tmpLow = this.candles[i].low;
          tmpHigh = this.candles[i].low;
          if (tmpLow < lowest) lowest = tmpLow;
          if (tmpHigh > highest) highest = tmpHigh;
        }

        this.chartOptions.dataset = {}
        this.chartOptions.dataset.source = this.candles;

        this.chartOptions.dataZoom[1].startValue = lowest;
        this.chartOptions.dataZoom[1].endValue = highest;
        this.chartOptions.legend = {
          data: ['K']
        }

        this.chartOptions.series = [
          {
            //name: 'K',
            type: 'candlestick',
            encode: {x: 'start', y: ['open', 'close', 'high', 'low'], tooltip: ['open', 'close', 'high', 'low']},
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
            type: 'line',
            encode:
              {
                x: 'start',
                y: 'close'
              },
            showSymbol: false
          }
        ]
        this.chartOptions.dimensions = [
          {name: 'low', type: 'number', displayName: 'Low'},
          {name: 'high', type: 'number', displayName: 'High'},
          {name: 'open', type: 'number', displayName: 'Open'},
          {name: 'close', type: 'number', displayName: 'Close'},
          {name: 'start', displayName: 'Start'}
        ]

        if (this.trades && this.trades.length) {
          let self = this
          _.each(this.trades, function (item) {
            let tmp = {
              coord: [item.date.toString(), item.price],
              name: item.action,
              label: {
                position: item.action === 'sell' ? 'top' : 'bottom',
                distance: 15
              },
              value: item.action + '\n' + item.price,
              symbolSize: [15, 30],
              symbol: 'arrow',
              symbolRotate: item.action === 'sell' ? 180 : 0,
              //symbolOffset: item.action === 'sell' ? [0, -5] : [0, 5],
              itemStyle: {
                color: item.action === 'sell' ? self.upColor : self.downColor
              }
            }
            tradeMarkings.push(tmp)
          });
          this.chartOptions.series[0]['markPoint'] = {
            data: tradeMarkings
          }
        }

        this.chartRef.setOption(this.chartOptions, true)
      }
    },
    computed: {}
    ,
    watch: {
      candles: function (newVal, oldVal) {
        this.updateCandles();
      }
      ,
      trades: function (newVal, oldVal) {
        this.updateCandles();
      }
    }
  }
  ;
</script>
