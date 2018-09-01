<template>
  <div>
    <div>
      <h4>Backtest result</h4>
    </div>
    <div>
      <result-summary v-if="result && result.performanceReport" :report="result.performanceReport"/>
    </div>
    <div>
      <echart :candles="candles" :trades="trades" :indicators="indicators"></echart>
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
    <div>
      <roundtrip-table v-if="result && result.performanceReport" :roundtrips="result.roundtrips" :asset="result.performanceReport.asset" :currency="result.performanceReport.currency"/>
    </div>
  </div>
</template>

<script>
  import resultSummary from './summary'
  import roundtripTable from './roundtripTable'
  import echart from '../../global/chart'
  import ExcelJson from 'vue-json-excel'
  import _ from 'lodash'

  export default {
    props: ['result'],
    data: function () {
      return {}
    },
    computed: {
      candles: function () {
        return this.result.stratCandles || []
      },
      trades: function () {
        return this.result.trades || []
      },
      indicators: function () {
        return this.result.stratUpdates || []
      }
    },
    methods: {
      genExportable: function () {
        if (this.candles && this.candles.length && this.trades && this.trades.length) {
          let exCandles = _.cloneDeep(this.candles);
          _.each(this.trades, function (item) {
            // lookup timestamp inside candles table
            let idx = _.indexOf(exCandles, _.find(exCandles, function (o) {
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
      roundtripTable,
      resultSummary,
      echart,
      ExcelJson
    }
  }
</script>
