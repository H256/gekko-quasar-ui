<template>
  <div class="q-my-md">
    <div class="text-h5 q-mb-md">Backtest result</div>
    <div>
      <result-summary v-if="result && result.performanceReport" :report="result.performanceReport"/>
    </div>
    <div v-if="candles.length">
      <q-card flat bordered class="q-my-md">
        <q-card-section class="bg-cyan-1">
          <div class="text-h6">Market graph</div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <echart :candles="candles" :trades="trades" :indicators="indicators"></echart>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-actions align="around">
          <excel-json
            :data="genExportable()"
            name="Backtest-Result.csv"
            type="csv"
          >
            <q-btn flat icon="file_download" label="backtest CSV" color="amber"></q-btn>
          </excel-json>
          <excel-json
            :data="genExportable()"
            name="Backtest-Result.xls"
            type="xls"
          >
            <q-btn flat icon="file_download" label="backtest XLS" color="amber"></q-btn>
          </excel-json>
          <excel-json
            v-if="result.roundtrips && result.roundtrips.length"
            :data="result.roundtrips"
            name="Backtest-Roundtrips.xls"
            type="xls"
          >
            <q-btn flat icon="file_download" label="roundtrips XLS" color="teal"></q-btn>
          </excel-json>
          <excel-json
            v-if="result.roundtrips && result.roundtrips.length"
            :data="result.roundtrips"
            name="Backtest-Roundtrips.csv"
            type="csv"
          >
            <q-btn flat icon="file_download" label="roundtrips csv" color="teal"></q-btn>
          </excel-json>
        </q-card-actions>
      </q-card>
    </div>
    <div>
      <roundtrip-table
        v-if="result && result.performanceReport"
        :roundtrips="result.roundtrips"
        :asset="result.performanceReport.asset"
        :currency="result.performanceReport.currency"
      />
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
