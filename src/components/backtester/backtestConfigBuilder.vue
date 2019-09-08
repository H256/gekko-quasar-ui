<template>
  <div>
    <dataset-picker v-on:dataset="updateDataset"></dataset-picker>
    <strat-picker v-on:stratConfig="updateStrat"></strat-picker>
    <paper-trader v-on:settings="updatePaperTrader"></paper-trader>
  </div>
</template>

<script>
  import datasetPicker from "../global/configbuilder/datasetpicker.vue";
  import stratPicker from "../global/configbuilder/stratpicker.vue";
  import paperTrader from "../global/configbuilder/papertrader.vue";
  import _ from "lodash";

  export default {
    async created() {
      try {
        let response = await this.$axios.get(this.$store.state.config.apiBaseUrl + "configPart/performanceAnalyzer")
        this.performanceAnalyzer = toml.parse(response.data.part);
        this.performanceAnalyzer.enabled = true;
      } catch (error) {
        this.$q.notify({
          type: "negative",
          message: "Error getting Perfomance-Analyser config from server."
        });
      }
    },
    data: () => {
      return {
        dataset: {},
        strat: {},
        paperTrader: {},
        performanceAnalyzer: {}
      };
    },
    components: {
      stratPicker,
      datasetPicker,
      paperTrader
    },
    computed: {
      market: function () {
        if (!this.dataset.exchange) return {};

        return {
          exchange: this.dataset.exchange,
          currency: this.dataset.currency.toUpperCase(),
          asset: this.dataset.asset.toUpperCase()
        };
      },
      range: function () {
        if (!this.dataset.exchange) return {};

        return {
          from: this.dataset.from,
          to: this.dataset.to
        };
      },
      config: function () {
        let config = {};
        Object.assign(
          config,
          {watch: this.market},
          {paperTrader: this.paperTrader},
          this.strat,
          {
            backtest: {
              daterange: this.range
            },
            backtestResultExporter: {
              enabled: true,
              writeToDisk: false,
              data: {
                stratUpdates: true,
                roundtrips: true,
                stratCandles: true,
                stratCandleProps: ['open', 'close', 'high', 'low', 'vwp', 'volume'],
                trades: true
              }
            }
          },
          {performanceAnalyzer: this.performanceAnalyzer}
        );

        config.valid = this.validConfig(config);
        config.backtestResultExporter.enabled = true; // this is globally switching resultExporter on?

        return config;
      }
    },
    methods: {
      validConfig: function (config) {
        if (!config.backtest) return false;

        if (!config.backtest.daterange) return false;

        if (_.isEmpty(config.backtest.daterange)) return false;

        if (!config.watch) return false;

        if (!config.tradingAdvisor) return false;

        let strat = config.tradingAdvisor.method;
        if (_.isEmpty(config[strat])) return false;

        if (config.tradingAdvisor) {
          if (_.isNaN(config.tradingAdvisor.candleSize)) return false;
          else if (config.tradingAdvisor.candleSize === 0) return false;
        }

        return true;
      },
      updateDataset: function (set) {
        this.dataset = set;
        this.$emit("config", this.config);
      },
      updateStrat: function (sc) {
        this.strat = sc;
        this.$emit("config", this.config);
      },
      updatePaperTrader: function (pt) {
        this.paperTrader = pt;
        this.paperTrader.enabled = true;
        this.$emit("config", this.config);
      }
    }
  };
</script>
