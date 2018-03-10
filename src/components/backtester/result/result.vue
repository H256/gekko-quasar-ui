<template>
  <div>
    <div>
      <h3>Backtest result</h3>
    </div>
    <div>
      <result-summary :report="result.report" />
    </div>
    <div>
      <chart :data="result" height="500" />
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

export default {
  props: ['result'],
  data: () => {
    return {}
  },
  methods: {},
  components: {
    roundtripTable,
    resultSummary,
    chart
  }
}
</script>
