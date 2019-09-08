<template>
  <div class="q-my-md">
    <div class="row q-col-gutter-md">
      <div class="col">
        <div class="text-h5">Strategy</div>
      </div>
      <div class="col">
        <div class="text-h5">Parameters</div>
      </div>
    </div>
    <div class="row q-col-gutter-md">
      <div class="col">
        <q-select
          label="Strategy"
          hint="Pick a strategy"
          filter
          autofocus-filter
          v-model="strategy"
          :options="strategiesForList"
          map-options
          emit-value
        />
        <div class="row q-col-gutter-xs">
          <div class="col">
            <q-input v-model="rawCandleSize" label="Candle Size" hint="input a candle size" type="number"/>
          </div>
          <div class="col">
            <q-select
              label="Unit"
              v-model="candleSizeUnit"
              :options="candleSizeUnits"
              hint="Candlesize unit"
              map-options
              emit-value
            />
          </div>
        </div>
        <q-input
          v-model="historySize"
          :label="'Warmup period (in ' + rawCandleSize + ' ' + singularCandleSizeUnit + ' candles):'"
          :hint="'(will use ' + warmupHumanized +' of data as history)'"
          type="number"
        />
      </div>
      <div class="col">
        <q-input
          v-model="rawStratParams"
          :label=" strategy + ' Parameters:'"
          type="textarea"
          hint="Adjust parameters here"
          rows="10"
          :max-height="100"
          class="text-italic"
          :filled="!!rawStratParamsError"
          :error="!!rawStratParamsError"
          :error-label="rawStratParamsError.message"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import humanizeDuration from 'humanize-duration'
  import StrategyService from '../../mixins/StrategyService'

  export default {
    mixins: [StrategyService],
    data: function () {
      return {
        candleSizeUnits: [{label: 'minutes', value: 'minutes'}, {label: 'hours', value: 'hours'}, {
          label: 'days',
          value: 'days'
        }],
        candleSizeUnit: 'hours',
        rawCandleSize: 1,

        strategy: 'MACD',
        historySize: 10,

        rawStratParams: '',
        rawStratParamsError: false,

        emptyStrat: false,
        stratParams: {}
      };
    },
    created: function () {
      this.getStrategies();
    },
    watch: {
      strategy: function (strat) {
        strat = _.find(this.strategies, {name: strat});
        this.rawStratParams = strat.params;
        this.emptyStrat = strat.empty;

        this.emitConfig();
      },
      candleSize: function () {
        this.emitConfig()
      },
      historySize: function () {
        this.emitConfig()
      },
      rawStratParams: function () {
        this.emitConfig()
      }
    },
    computed: {
      warmupHumanized: function () {
        return humanizeDuration(this.candleSize * this.historySize * 1000 * 60)
      },
      candleSize: function () {
        if (this.candleSizeUnit === 'minutes')
          return this.rawCandleSize;
        else if (this.candleSizeUnit === 'hours')
          return this.rawCandleSize * 60;
        else if (this.candleSizeUnit === 'days')
          return this.rawCandleSize * 60 * 24;
      },
      singularCandleSizeUnit: function () {
        // hours -> hour
        return this.candleSizeUnit.slice(0, -1);
      },
      config: function () {
        let config = {
          tradingAdvisor: {
            enabled: true,
            method: this.strategy,
            candleSize: +this.candleSize,
            historySize: +this.historySize
          }
        }

        if (this.emptyStrat)
          config[this.strategy] = {__empty: true}
        else
          config[this.strategy] = this.stratParams;

        return config;
      }
    },
    methods: {
      emitConfig: function () {
        this.parseParams();
        this.$emit('stratConfig', this.config);
      },
      parseParams: function () {
        try {
          this.stratParams = toml.parse(this.rawStratParams);
          this.rawStratParamsError = false;
        } catch (e) {
          this.rawStratParamsError = e;
          this.stratParams = {};
        }
      }
    }
  }
</script>
