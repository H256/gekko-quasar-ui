<template>
  <div>
    <div class="row">
      <div class="col-6">
        <dl class="horizontal">
          <dt>Start time</dt>
          <dd>{{report.startTime}}</dd>
          <dt>End time</dt>
          <dd>{{report.endTime}}</dd>
          <dt>Timespan</dt>
          <dd>{{report.timespan}}</dd>
          <dt>Start price</dt>
          <dd>{{report.startPrice}} {{report.currency}}</dd>
          <dt>End price</dt>
          <dd>{{report.endPrice}} {{report.currency}}</dd>
          <dt>Market</dt>
          <dd class="text-weight-medium" :class="{'text-negative' : report.market < 0, 'text-positive': report.market > 0}">{{report.market.toFixed(6)}} %</dd>
        </dl>
      </div>
      <div class="col-6">
        <paper-trade-summary :report="report" />
      </div>
    </div>    
  </div>
</template>

<script>
import paperTradeSummary from '../../global/paperTradeSummary.vue'

export default {
  props: ['report'],
  components: {
    paperTradeSummary
  },
  methods: {
    round: n => (+n).toFixed(5)
  }
}
</script>
