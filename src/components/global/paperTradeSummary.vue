<template>
  <dl class="horizontal">
    <dt>Amount of trades</dt>
    <dd>{{report.trades}}</dd>
    <dt>Sharpe ratio</dt>
    <dd>{{round2(report.sharpe)}}</dd>
    <dt>Start Balance</dt>
    <dd>{{round(report.startBalance)}} {{report.currency}}</dd>
    <dt>End Balance</dt>
    <dd>{{round(report.balance)}} {{report.currency}}</dd>
    <dt>Simulated profit</dt>
    <dd class="text-h6" :class="profitClass">{{round(report.relativeProfit)}} %</dd>
  </dl>
</template>

<script>
export default {
  props: ['report'],
  methods: {
    round2: n => (+n).toFixed(2),
    round: n => (+n).toFixed(5)
  },
  computed: {
    profitClass: function() {
      if(this.report.relativeProfit > 0)
        return 'text-positive'
      else
        return 'text-negative'
    }
  }
}
</script>
