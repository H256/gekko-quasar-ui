<template>
  <div>
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-card dense flat bordered class="q-pa-sm bg-cyan-1">
          <div class="row">
            <div class="col">Start time</div>
            <div class="col text-italic">{{report.startTime}}</div>
          </div>
          <div class="row">
            <div class="col">End time</div>
            <div class="col text-italic">{{report.endTime}}</div>
          </div>
          <div class="row">
            <div class="col">Timespan</div>
            <div class="col text-italic">{{report.timespan}}</div>
          </div>
          <div class="row">
            <div class="col">Start price</div>
            <div class="col text-italic">{{report.startPrice}}</div>
          </div>
          <div class="row">
            <div class="col">End price</div>
            <div class="col text-italic">{{report.endPrice}}</div>
          </div>
          <div class="row">
            <div class="col">Market</div>
            <div class="col text-weight-medium text-italic"
                 :class="{'text-negative' : report.market < 0, 'text-positive': report.market > 0}">
              {{report.market.toFixed(6)}} %
            </div>
          </div>
        </q-card>
      </div>
      <div class="col-6">
        <paper-trade-summary :report="report"/>
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
