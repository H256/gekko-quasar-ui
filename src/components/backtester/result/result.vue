<template>
  <div>
    <div>
      <h3>Backtest result</h3>
    </div>
    <div>
      <result-summary :report="result.report"/>
    </div>
    <div>
      <echart :candles="candles" :trades="trades"></echart>
    </div>
    <div class="row justify-center">
      <excel-json class="column q-pa-sm" :data="genExportable()" name="Backtest-Result.csv" type="csv">
        <q-btn icon="file download" label="backtest CSV" color="amber"></q-btn>
      </excel-json>
      <excel-json class="column q-pa-sm" :data="genExportable()" name="Backtest-Result.xls" type="xls">
        <q-btn icon="file download" label="backtest XLS" color="amber"></q-btn>
      </excel-json>
      <excel-json v-if="result.roundtrips && result.roundtrips.length" class="column q-pa-sm" :data="result.roundtrips"
                  name="Backtest-Roundtrips.xls" type="xls">
        <q-btn icon="file download" label="roundtrips XLS" color="teal"></q-btn>
      </excel-json>
      <excel-json v-if="result.roundtrips && result.roundtrips.length" class="column q-pa-sm" :data="result.roundtrips"
                  name="Backtest-Roundtrips.csv" type="csv">
        <q-btn icon="file download" label="roundtrips csv" color="teal"></q-btn>
      </excel-json>
    </div>
    <indicator-chart :candles="candles" :trades="trades" :indicators="indicators"
                     v-if="result.indicatorResults"></indicator-chart>
    <div>
      <roundtrip-table :roundtrips="result.roundtrips" :asset="result.report.asset" :currency="result.report.currency"/>
    </div>
  </div>
</template>

<script>
  import resultSummary from './summary.vue'
  import roundtripTable from './roundtripTable.vue'
  import echart from '../../global/chart.vue'
  import IndicatorChart from '../../global/indicatorChart'
  import ExcelJson from 'vue-json-excel'
  import _ from 'lodash'

  export default {
    props: ['result'],
    data: function () {
      return {}
    },
    computed: {
      candles: function () {
        return this.result.candles || []
      },
      trades: function () {
        return this.result.trades || []
      },
      indicators: function () {
        return this.result.indicatorResults || []
      }
    },
    methods: {
      genExportable: function () {
        if (this.candles && this.candles.length && this.trades && this.trades.length) {
          let exCandles = _.cloneDeep(this.candles);
          _.each(this.trades, function (item) {
            // lookup timestamp inside candles table
            let idx = _.indexOf(exCandles, _.find(exCandles, function (o) {
              console.log(o.start === item.date);
              return o.start === item.date
            }))
            // set trade as column in the table
            if (idx >= 0) {
              _.set(exCandles[idx], 'advice', item.action);
            }
          });
          _.each(exCandles, function (item) {
            if (!item.advice) _.set(item, 'advice', '');
          });
          return exCandles;
        }
        return [];
      }
    },
    components: {
      IndicatorChart,
      roundtripTable,
      resultSummary,
      echart,
      ExcelJson
    }
  }
</script>
