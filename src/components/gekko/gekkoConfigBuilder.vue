<template>
  <div>
    <h4 class="q-mb-xs">Type & Market</h4>
    <div class="row q-mb-md">
        <type-picker v-on:type="updateType"/>
    </div>
    <div class="row">
      <div class="col-6">
        <market-picker v-on:market='updateMarketConfig' :only-tradable="isTradebot"/>
      </div>
    </div>
    <strat-picker v-if="!isMarketWatcher" v-on:stratConfig="updateStrat"/>
    <paper-trader v-if="isPaperTrader" v-on:settings="updatePaperTrader"/>
  </div>
</template>

<script>

  import marketPicker from '../global/configbuilder/marketpicker.vue'
  import typePicker from '../global/configbuilder/typepicker.vue'
  import stratPicker from '../global/configbuilder/stratpicker.vue'
  import paperTrader from '../global/configbuilder/papertrader.vue'
  import _ from 'lodash'

  export default {

    created: function () {
      this.$axios.get(this.$store.state.config.apiBaseUrl + 'configPart/candleWriter')
        .then(response => {
          this.candleWriter = toml.parse(response.data.part);
        })
        .catch(error => {
          console.log("error getting candlewriter-config", error);
        });

      this.$axios.get(this.$store.state.config.apiBaseUrl + 'configPart/performanceAnalyzer')
        .then(response => {
          this.performanceAnalyzer = toml.parse(response.data.part);
          this.performanceAnalyzer.enabled = true;
        })
        .catch(error => {
          console.log("error getting performance-analyzer-config", error);
        });
    },
    data: () => {
      return {
        market: {},
        range: {},
        type: '',
        strat: {},
        paperTrader: {},
        candleWriter: {},
        performanceAnalyzer: {}
      }
    },
    components: {
      marketPicker,
      typePicker,
      stratPicker,
      paperTrader
    },
    computed: {
      isTradebot: function () {
        return this.type && this.type.label ? this.type.label.toLowerCase() === 'tradebot' : false;
      },
      isPaperTrader() {
        return this.type && this.type.label ? this.type.label.toLowerCase() === 'paper trader' : false;
      },
      isMarketWatcher() {
        return this.type && this.type.label ? this.type.label.toLowerCase() === 'market watcher' : false;
      },
      config: function () {
        let config = {};
        Object.assign(
          config,
          this.market,
          this.strat,
          {paperTrader: this.paperTrader},
          {candleWriter: this.candleWriter},
          {type: this.type},
          {performanceAnalyzer: this.performanceAnalyzer}
        );

        if (this.isTradebot) {
          delete config.paperTrader;
          config.trader = {enabled: true}
        }

        config.valid = this.validConfig(config);

        return config;
      }
    },
    methods: {
      validConfig: config => {
        if (config.type === 'market watcher')
          return true;

        if (!config.tradingAdvisor)
          return false;
        if (_.isNaN(config.tradingAdvisor.candleSize))
          return false;
        else if (config.tradingAdvisor.candleSize == 0)
          return false;

        let strat = config.tradingAdvisor.method;
        if (_.isEmpty(config[strat]))
          return false;

        return true;
      },
      updateMarketConfig: function (mc) {
        this.market = mc;
        this.emitConfig();
      },
      updateType: function (type) {
        this.type = type;//type.label.toLowerCase();
        this.emitConfig();
      },
      updateStrat: function (strat) {
        this.strat = strat;
        this.emitConfig();
      },
      updatePaperTrader: function (pt) {
        this.paperTrader = pt;
        this.paperTrader.enabled = true;
        this.emitConfig();
      },

      emitConfig: function () {
        this.$emit('config', this.config);
      }
    }
  }
</script>
