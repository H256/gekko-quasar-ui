<template>
<div>    
  <div class="row gutter-md">
    <div class="col-4"><h3>Strategy</h3></div>
    <div class="col-3"><h3>Parameters</h3></div>
  </div>
  <div class="row gutter-md">
    <div class="col-4">
      <q-field
      label="Strategy"
      orientation="vertical"      
      helper="Pick a strategy"
      :label-width="2"
      >
      <q-select
      filter
      autofocus-filter
      v-model="strategy"
      :options="strategiesForList"
      
      />
      </q-field>
      <div class="row q-mt-md gutter-sm">
        <q-field class="col-6" 
          label="Candle Size"
          orientation="vertical" 
          helper="input a canlde size">
          <q-input v-model="rawCandleSize" type="number" />
        </q-field>
        <q-field class="col-6"
          label="Unit"
          orientation="vertical" 
          helper="Canldesize unit"
          :label-width="2"
          >
          <q-select
            v-model="candleSizeUnit"
            :options="candleSizeUnits"
          />
        </q-field>
      </div>
      <q-field 
        :label="'Warmup period (in ' + rawCandleSize + ' ' + singularCandleSizeUnit + ' candles):'"
        orientation="vertical" 
        class="q-mt-md" 
        :helper="'(will use ' + warmupHumanized +' of data as history)'">
          <q-input 
            v-model="historySize" 

            type="number" 
            />
      </q-field>
    </div>
    <div class="col-3">
      <q-field
        :label=" strategy + ' Parameters:'"
        orientation="vertical"
        :error="!!rawStratParamsError"
        :error-label="rawStratParamsError.message"
        class="q-mt-md" 
        helper="Adjust parameters here">
          <q-input 
            v-model="rawStratParams" 
            type="textarea"
            rows="12"
            :max-height="100"
            :inverted="!!rawStratParamsError"
            />
      </q-field>
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
  data: () => {
    return {
      candleSizeUnits: [{label:'minutes', value: 'minutes'}, {label:'hours', value: 'hours'}, {label:'days', value:'days'}],
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
    strategy: function(strat) {
      strat = _.find(this.strategies, { name: strat });
      this.rawStratParams = strat.params;
      this.emptyStrat = strat.empty;

      this.emitConfig();
    },
    candleSize: function() { this.emitConfig() },
    historySize: function() { this.emitConfig() },
    rawStratParams: function() { this.emitConfig() }
  },
  computed: {
    warmupHumanized: function(){
      return humanizeDuration(this.candleSize * this.historySize * 1000 * 60)
    },
    candleSize: function() {
       if(this.candleSizeUnit === 'minutes')
        return this.rawCandleSize;
      else if(this.candleSizeUnit === 'hours')
        return this.rawCandleSize * 60;
      else if(this.candleSizeUnit === 'days')
        return this.rawCandleSize * 60 * 24;
    },
    singularCandleSizeUnit: function() {
      // hours -> hour
      return this.candleSizeUnit.slice(0, -1);
    },
    config: function() {
      let config = {
        tradingAdvisor: {
          enabled: true,
          method: this.strategy,
          candleSize: +this.candleSize,
          historySize: +this.historySize
        }
      }

      if(this.emptyStrat)
        config[this.strategy] = {__empty: true}
      else
        config[this.strategy] = this.stratParams;

      return config;
    }
  },
  methods: {
    emitConfig: function() {
      this.parseParams();
      this.$emit('stratConfig', this.config);
    },
    parseParams: function() {
      try {
        this.stratParams = toml.parse(this.rawStratParams);
        this.rawStratParamsError = false;
      } catch(e) {
        this.rawStratParamsError = e;
        this.stratParams = {};
      }
    }
  }
}
</script>