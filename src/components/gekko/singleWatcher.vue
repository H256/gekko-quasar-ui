<template>
  <q-page padding>
    <div v-if="!data">
      <h2 class="text-negative">ERROR: Unknown watcher</h2>
      <p>Gekko does'nt know what watcher this is.</p>
    </div>
    <template v-if="data">
      <h3>Market Watcher</h3>
      <div class="row">
        <div class="col-2">
          <strong>Market:</strong>
        </div>
        <div class="col-10">{{data.watch.exchange}}</div>
      </div>
      <div class="row">
        <div class="col-2">
          <strong>Currency</strong>
        </div>
        <div class="col-10">{{data.watch.currency}}</div>
      </div>
      <div class="row">
        <div class="col-2">
          <strong>Asset:</strong>
        </div>
        <div class="col-10">{{data.watch.asset}}</div>
      </div>
      <h3>Statistics</h3>
      <div class="row" v-if="isLoading">
        <div class="col-2 text-center">
          <q-spinner-bars size="36" color="tertiary"/>
        </div>
      </div>
      <div class="row" v-if="!isLoading && data.firstCandle">
        <div class="col-2">
          <strong>Watching since:</strong>
        </div>
        <div class="col-10">{{fmt(data.firstCandle.start)}}</div>
      </div>
      <div class="row" v-if="!isLoading && data.lastCandle">
        <div class="col-2">
          <strong>Received data until:</strong>
        </div>
        <div class="col-10">{{fmt(data.lastCandle.start)}}</div>
      </div>
      <div class="row" v-if="!isLoading && data.firstCandle">
        <div class="col-2">
          <strong>Data spanning:</strong>
        </div>
        <div class="col-10">{{dataSpanning}}</div>
      </div>

      <div class="row" v-if="!isLoading && candleFetch === 'fetching'">
        <div class="col-2 text-center">
          <q-spinner-bars size="36" color="tertiary"/>
        </div>
      </div>
      <echart v-if="candles.length" :candles="chartData.candles" :trades="chartData.trades" height="500"/>
    </template>

  </q-page>
</template>

<script>
  import moment from "moment";
  import humanizeDuration from "humanize-duration";

  import _ from "lodash";

  import echart from '../global/chart'

  export default {
    created: function () {
      if (!this.isLoading) {
        this.getCandles();
      }
    },
    components: {
      echart
    },
    data: () => {
      return {
        candleFetch: "idle",
        candles: []
      };
    },
    computed: {
      watchers: function () {
        return this.$store.state.watchers.watchers;
      },
      data: function () {
        return _.find(this.watchers, {id: this.$route.params.id});
      },
      chartData: function () {
        return {
          candles: this.candles,
          trades: []
        };
      },
      isLoading: function () {
        if (!this.data) return true;
        if (!_.isObject(this.data.firstCandle)) return true;
        if (!_.isObject(this.data.lastCandle)) return true;

        return false;
      },
      dataSpanning: function () {
        return humanizeDuration(moment(this.data.lastCandle.start).diff(moment(this.data.firstCandle.start))) || ''
      }
    },
    watch: {
      'data.lastCandle.start': function () {
        this.candleFetch = "dirty";
      },
      data: function (val, prev) {
        let complete = val && val.firstCandle && val.lastCandle;

        if (!complete) return;

        if (this.candleFetch !== 'fetched') this.getCandles();
      }
    },
    methods: {
      humanizeDuration: n => humanizeDuration(n),
      moment: mom => moment.utc(mom),
      fmt: mom => moment.utc(mom).format("YYYY-MM-DD HH:mm"),
      getCandles: function () {
        this.candleFetch = "fetching";

        // up unto we have data
        let to = moment.utc(this.data.lastCandle.start).unix();

        // max 7 days of data
        let from = Math.max(
          moment.utc(this.data.firstCandle.start).unix(),
          moment.utc(to).subtract(7, "days").unix()
        );

        const diff = to - from;
        let candleSize = 60;
        if (diff < 60 * 60 * 24) {// a day
          if (diff < 60 * 60 * 12) {// 3 hours
            candleSize = 5;
          }
          else {
            candleSize = 15;
          }
        }

        from = moment.unix(from).utc().format();
        to = moment.unix(to).utc().format();

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
          .post(this.$store.state.config.apiBaseUrl + "getCandles", config)
          .then(response => {
            //console.log("Successfully loaded candles", response.data)
            this.candleFetch = "fetched";
            this.candles = response.data.map(c => {
              c.start = moment.unix(c.start).utc().format();
              return c;
            });
          })
          .catch(error => {
            console.log("Error on getting candle Data", error);
            /*this.$q.notify({
              type: "negative",
              message: "Error getting candle-data."
            });*/
          });
      }
    }
  };
</script>
