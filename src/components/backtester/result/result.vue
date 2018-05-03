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
    <div>
      <roundtrip-table :roundtrips="result.roundtrips" :asset="result.report.asset" :currency="result.report.currency" />
    </div>
  </div>
</template>

<script>
import resultSummary from './summary.vue'
import roundtripTable from './roundtripTable.vue'
import echart from '../../global/chart.vue'

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
    }
  },
  methods: {},
  components: {
    roundtripTable,
    resultSummary,
    echart
  }
}
</script>
