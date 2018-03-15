<template>
  <div>
    <div>
      <h3>Backtest result</h3>
    </div>
    <div>
      <result-summary :report="result.report" />
    </div>
    <echart :candles="candles"></echart>
    <div>
     <!-- <chart :data="result" height="500" /> -->
    </div>
    <div>
      <roundtrip-table :roundtrips="result.roundtrips" />
    </div>
  </div>
</template>

<script>
import resultSummary from './summary.vue'
import chart from './chartWrapper.vue'
import roundtripTable from './roundtripTable.vue'
import echart from '../../global/chart.vue'

export default {
  props: ['result'],
  data: () => {
    return {}
  },
  computed: {
    candles: function(){
      return this.result.candles || []
    }
  },
  methods: {},
  components: {
    roundtripTable,
    resultSummary,
    chart,
    echart
  }
}
</script>
