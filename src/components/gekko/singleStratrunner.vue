<template>
  <q-page padding>
    <div v-if="!data">
      <h2 class="text-negative">Unknown Strat runner</h2>
      <p>Gekko doesn't know what strat runner this is...</p>
    </div>
    <div v-if="data">
      <h2>Strat runner</h2>
      <div class="row">
        <div class="col-3">
          <h3>Market</h3>
          <div class="row">
            <div class="col">
              <strong>Market:</strong>
            </div>
            <div class="col">{{data.watch.exchange}}</div>
          </div>
          <div class="row">
            <div class="col">
              <strong>Currency:</strong>
            </div>
            <div class="col">{{data.watch.currency}}</div>
          </div>
          <div class="row">
            <div class="col">
              <strong>Asset:</strong>
            </div>
            <div class="col">{{data.watch.asset}}</div>
          </div>
        </div>
        <div class="col-4">
          <h3>Runtime</h3>
          <div class="row justify-center" v-if="isLoading">
            <q-spinner-bars size="36px" color="primary" />
          </div>
          <div class="row" v-if="!isLoading">
            <div class="col">
              <strong>Watching since:</strong>
            </div>
            <div class="col">{{ fmt(data.firstCandle.start) }}</div>
          </div>
          <div class="row" v-if="!isLoading">
            <div class="col">
              <strong>Received data until:</strong>
            </div>
            <div class="col">{{ fmt(data.lastCandle.start) }}</div>
          </div>
          <div class="row" v-if="!isLoading">
            <div class="col">
              <strong>Data spanning:</strong>
            </div>
            <div class="col">{{ humanizeDuration(moment(data.lastCandle.start).diff(moment(data.firstCandle.start))) }}</div>
          </div>
          <div class="row" v-if="!isLoading">
            <div class="col">
              <strong>Amount of trades:</strong>
            </div>
            <div class="col">{{ data.trades.length }}</div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-4">
          <h3>Strategy</h3>
          <div class="row">
            <div class="col">Name</div>
            <div class="col"><strong>{{ stratName }}</strong></div>
          </div>
          <div class="row">
            Parameters
          </div>
          <div class="row">
            <pre>{{ stratParams }}</pre>
          </div>
        </div>
        <div class="col-4">
          <h3>Profit report</h3>
          <p v-if="!report"><em>Waiting for at least one trade...</em></p>
          <div class="row" v-if="report">
            <div class="col">
              <strong>Start balance:</strong>
            </div>
            <div class="col">{{ round(report.startBalance) }}</div>
          </div>
          <div class="row" v-if="report">
            <div class="col">
              <strong>Current balance:</strong>
            </div>
            <div class="col">{{ round(report.balance) }}</div>
          </div>
          <div class="row" v-if="report">
            <div class="col">
              <strong>Market:</strong>
            </div>
            <div class="col">{{ round(report.market) }} {{ data.watch.currency }}</div>
          </div>
          <div class="row" v-if="report">
            <div class="col">
              <strong>Profit:</strong>
            </div>
            <div class="col">{{ round(report.profit) }} {{ data.watch.currency }}</div>
          </div>
          <div class="row" v-if="report">
            <div class="col">
              <strong>Alpha:</strong>
            </div>
            <div class="col">{{ round(report.alpha) }} {{ data.watch.currency }}</div>
          </div>
        </div>
      </div>
      <div class="row">
        <p v-if="watcher">
          <em>This strat runner gets data from <router-link :to="'/live-gekkos/watcher/' + watcher.id">this market watcher</router-link></em>
        </p>
      </div>
      <div v-if="!isLoading">
        <h3>Market Graph</h3>
        <div class="row justify-center">
          <q-spinner-bars v-if="candleFetch === 'fetching'" color="primary" size="36px" />
          <echart v-if="candleFetch === 'fetched'" :candles="chartData.candles" :trades="chartData.trades" />
        </div>
        <div class="row">
          <roundtrips class="col-12" :roundtrips="data.roundtrips"/>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import moment from "moment";
import humanizeDuration from "humanize-duration";

import Vue from "vue";
import _ from "lodash";

import echart from '../global/chart'

import roundtrips from "../backtester/result/roundtripTable.vue";
import paperTradeSummary from "../global/paperTradeSummary.vue";

export default {
  created: function() {
    if (!this.isLoading) this.getCandles();
  },
  components: {
    echart,
    paperTradeSummary,
    roundtrips
  },
  data: () => {
    return {
      candleFetch: "idle",
      candles: false
    };
  },
  computed: {
    stratrunners: function() {
      return this.$store.state.stratrunners.stratrunners;
    },
    data: function() {
      return _.find(this.stratrunners, { id: this.$route.params.id });
    },
    chartData: function() {
      return {
        candles: this.candles,
        trades: this.trades
      };
    },
    trades: function() {
      if (!this.data) return [];

      return this.data.trades;
    },
    report: function() {
      if (!this.data) return;

      return this.data.report;
    },
    stratName: function() {
      if (this.data) return this.data.strat.tradingAdvisor.method;
    },
    stratParams: function() {
      if (!this.data) return "";

      let stratParams = Vue.util.extend({}, this.data.strat.params);
      delete stratParams.__empty;

      if (_.isEmpty(stratParams)) return "No parameters";

      return JSON.stringify(stratParams, null, 4);
    },
    isLoading: function() {
      if (!this.data) return true;
      if (!_.isObject(this.data.firstCandle)) return true;
      if (!_.isObject(this.data.lastCandle)) return true;

      return false;
    },
    watchers: function() {
      return this.$store.state.watchers.watchers;
    },
    watcher: function() {
      let watch = Vue.util.extend({}, this.data.watch);
      return _.find(this.watchers, { watch });
    }
  },
  watch: {
    "data.lastCandle.start": function() {
      this.candleFetch = "dirty";
    },
    data: function(val, prev) {
      if (this.isLoading) return;

      if (this.candleFetch !== "fetched") this.getCandles();
    }
  },
  methods: {
    round: n => (+n).toFixed(5),
    humanizeDuration: n => humanizeDuration(n),
    moment: mom => moment.utc(mom),
    fmt: mom => moment.utc(mom).format("YYYY-MM-DD HH:mm"),
    getCandles: function() {
      this.candleFetch = "fetching";

      let to = this.data.lastCandle.start;
      let from = this.data.firstCandle.start;
      let candleSize = this.data.strat.tradingAdvisor.candleSize;

      let config = {
        watch: this.data.watch,
        daterange: {
          to,
          from
        },
        // hourly candles
        candleSize
      };

      this.$axios
        .post(this.$store.state.config.apiBaseUrl + "getCandles")
        .then(response => {
          this.candleFetch = "fetched";
          if (!_.isArray(res)) {
            return console.log(response);
          }

          this.candles = res.map(c => {
            c.start = moment
              .unix(c.start)
              .utc()
              .format();
            return c;
          });
        })
        .catch(error => {
          return console.log(error);
        });
    }
  }
};
</script>
