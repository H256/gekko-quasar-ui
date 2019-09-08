<template>
  <q-card dense flat bordered class="q-pa-sm bg-cyan-1">
    <div class="row">
      <div class="col">Amount of trades</div>
      <div class="col text-italic">{{report.trades}}</div>
    </div>
    <div class="row">
      <div class="col">Sharpe ratio</div>
      <div class="col text-italic">{{round2(report.sharpe)}}</div>
    </div>
    <div class="row">
      <div class="col">Start Balance</div>
      <div class="col text-italic">{{round(report.startBalance)}}</div>
    </div>
    <div class="row">
      <div class="col">End Balance</div>
      <div class="col text-italic">{{round(report.balance)}} {{report.currency}}</div>
    </div>
    <div class="row">
      <div class="col">Simulated profit</div>
      <div class="col text-italic text-h6" :class="profitClass">{{round(report.relativeProfit)}} %</div>
    </div>
  </q-card>
</template>

<script>
  export default {
    props: ['report'],
    methods: {
      round2: n => (+n).toFixed(2),
      round: n => (+n).toFixed(5)
    },
    computed: {
      profitClass: function () {
        if (this.report.relativeProfit > 0)
          return 'text-positive'
        else
          return 'text-negative'
      }
    }
  }
</script>
