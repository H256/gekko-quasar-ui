import _ from 'lodash'
import moment from 'moment'
import Vue from "vue";

export default {
  computed: {
    gekkos() {
      return this.$store.state.gekkos.gekkos;
    },
    stratrunners: function () {
      return _.values(this.$store.getters['gekkos/list'])
        .concat(_.values(this.$store.getters['gekkos/archive']))
        .filter(g => {
          if (g.logType === 'papertrader')
            return true;

          if (g.logType === 'tradebot')
            return true;

          return false;
        })
    },
    watchers: function () {
      return _.values(this.$store.getters['gekkos/list'])
        .concat(_.values(this.$store.getters['gekkos/archive']))
        .filter(g => g.logType === 'watcher')
    },
    watchConfig: function () {
      let raw = _.pick(this.config, "watch", "candleWriter");
      let watchConfig = Vue.util.extend({}, raw);
      watchConfig.type = "market watcher";
      watchConfig.mode = "realtime";
      return watchConfig;
    },
    requiredHistoricalData: function () {
      if (!this.config.tradingAdvisor || !this.config.valid) return;

      let stratSettings = this.config.tradingAdvisor;
      return stratSettings.candleSize * stratSettings.historySize;
    },
    gekkoConfig: function () {
      var startAt;

      if (!this.existingMarketWatcher) return;

      if (!this.requiredHistoricalData)
        startAt = moment().utc().startOf("minute").format();
      else {
        // TODO: figure out whether we can stitch data
        // without looking at the existing watcher
        const optimal = moment()
          .utc()
          .startOf("minute")
          .subtract(this.requiredHistoricalData, "minutes")
          .unix();

        const available = moment
          .utc(this.existingMarketWatcher.events.initial.candle.start)
          .unix();

        startAt = moment
          .unix(Math.max(optimal, available))
          .utc()
          .format();
      }

      const gekkoConfig = Vue.util.extend({
          market: {
            type: "leech",
            from: startAt
          },
          mode: "realtime"
        },
        this.config);
      return gekkoConfig;
    },
    existingMarketWatcher: function () {
      const market = Vue.util.extend({}, this.watchConfig.watch);
      return _.find(this.gekkos, {config: {watch: market}});
    },
    exchange: function () {
      return this.watchConfig.watch.exchange;
    },
    existingTradebot: function () {
      return _.find(
        this.gekkos,
        g => {
          if (g.logType === 'tradebot' && g.config.watch.exchange === this.exchange) {
            return true;
          }
          return false;
        }
      );
    },
    availableApiKeys: function () {
      return this.$store.state.config.apiKeys;
    }
  },
  watch: {
    // start the stratrunner
    existingMarketWatcher: function (val, prev) {
      if (!this.pendingStratrunner) return;

      const gekko = this.existingMarketWatcher;

      if (gekko.events.latest.candle) {
        this.pendingStratrunner = false;

        this.startGekko()
          .then(resp => this.routeToGekko(null, resp.data))
          .catch(error => this.routeToGekko(error, resp.data));
      }
    }
  },
  methods: {
    updateConfig: function (config) {
      this.config = config;
    },
    start: function () {
      // if the user starts a tradebot we do some
      // checks first.
      if (this.config.type === "tradebot" || (this.config.type.label && this.config.type.label.toLowerCase() === 'tradebot')) {
        if (this.existingTradebot) {
          let str = "You already have a tradebot running on this exchange";
          str += ", you can only run one tradebot per exchange.";
          return this.$q.dialog({
            title: "Bot already running",
            color: "warning",
            message: str
          });
        }

        if (!this.availableApiKeys.includes(this.exchange))
          return this.$q.dialog({
            title: "No API Keys found",
            color: "warning",
            message:
              "Please first configure API keys for this exchange in the config page."
          });
      }

      // internally a live gekko consists of two parts:
      //
      // - a market watcher
      // - a live gekko (strat runner + (paper) trader)
      //
      // however if the user selected type "market watcher"
      // the second part won't be created
      if (this.config.type === "market watcher" || (this.config.type.label && this.config.type.label.toLowerCase() === 'market watcher')) {
        // check if the specified market is already being watched
        if (this.existingMarketWatcher) {
          this.$q.dialog({
            title: "Market is already being watched",
            message: "This market is already being watched, redirecting you now..."
          });
          this.$router.push({
            path: `/live-gekkos/${this.existingMarketWatcher.id}`
          });
        } else {
          this.startWatcher()
            .then(resp => {
              this.$q.notify({
                type: "positive",
                message: "Watcher sucessfully started."
              });
              this.$router.push({
                path: `/live-gekkos/${resp.data.id}`
              });
            })
            .catch(error => {
              this.$q.notify({
                type: "negative",
                message: "Error while starting market watcher."
              });
            });
        }
      } else {
        if (this.existingMarketWatcher) {
          // the specified market is already being watched,
          // just start a gekko!
          this.startGekko()
            .then(resp => this.routeToGekko(null, resp.data))
            .catch(error => this.routeToGekko(error, resp.data));
        } else {
          // the specified market is not yet being watched,
          // we need to create a watcher
          this.startWatcher().then(resp => {
            // now we just wait for the watcher to be properly initialized
            // (see the `watch.existingMarketWatcher` method)
            this.pendingStratrunner = resp.data.id;
            this.$q.notify({
              type: "positive",
              message: "Watcher sucessfully started."
            });
          });
        }
      }
    },
    routeToGekko: function (err, resp) {
      if (err || resp.error) {
        this.$q.notify({
          type: "negative",
          message: "Error while starting live gekko."
        });
        return console.error(err, resp.error);
      }

      this.$router.push({
        path: `/live-gekkos/${resp.id}`
      });
    },
    startWatcher: function () {
      return this.$axios.post(
        this.$store.state.config.apiBaseUrl + "startGekko",
        this.watchConfig
      );
    },
    startGekko: function () {
      return this.$axios.post(
        this.$store.state.config.apiBaseUrl + "startGekko",
        this.gekkoConfig
      );
    }
  }
}
