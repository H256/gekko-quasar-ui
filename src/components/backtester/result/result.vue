<template>
  <div>
    <div>
      <h3>Backtest result</h3>
    </div>
    <div>
      <result-summary :report="result.report" />
    </div>
     <div>
      <echart :candles="candles" :trades="trades"></echart>
    </div>
      <indicator-chart :candles="candles" :trades="trades" :indicators="indicators" v-if="result.indicatorResults"></indicator-chart>
    <div>
      <roundtrip-table :roundtrips="result.roundtrips" :asset="result.report.asset" :currency="result.report.currency" />
    </div>
  </div>
</template>

<script>
import resultSummary from './summary.vue'
import roundtripTable from './roundtripTable.vue'
import echart from '../../global/chart.vue'
import IndicatorChart from '../../global/indicatorChart'

export default {
  props: ['result'],
  data: function() {
    return {}
  },
  computed: {
    candles: function(){
      return this.result.candles || []
    },
    trades: function() {
      return this.result.trades || []
    },
    indicators: function(){
      return this.result.indicatorResults || []
    }
  },
  methods: {},
  components: {
    IndicatorChart,
    roundtripTable,
    resultSummary,
    echart
  }
}
</script>
